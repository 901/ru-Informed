from election_api import app, db

from flask import jsonify, request
from sqlalchemy.sql import text
import json

@app.route('/api/v1/status', methods = ['GET'])
def status():
    return jsonify({ 'status': 'ok' })

@app.route('/api/v1/polls', methods = ['GET'])
def get_polls():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    q = """
    SELECT 
    state, 
    SUM(sample_size * clinton) / (SUM(sample_size * clinton) + SUM(sample_size * trump)) * 100.0 AS clinton, 
    SUM(sample_size * trump) / (SUM(sample_size * clinton) + SUM(sample_size * trump)) * 100.0 AS trump
    FROM polls
    WHERE start_date BETWEEN :start_date AND :end_date
    AND end_date BETWEEN :start_date AND :end_date
    GROUP BY state
    """

    ret = db.engine.execute(text(q), start_date = start_date, end_date = end_date)
    ret = list(
        map(
            lambda row: {
                'state': row[0],
                'clinton': row[1],
                'trump': row[2]
            }, 
            ret
        )
    )

    return jsonify({ 'state_results': ret })

@app.route('/api/v1/polls/state', methods = ['GET'])
def get_polls_by_state():
    state = request.args.get('state')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    q = """
    SELECT 
    SUM(sample_size * clinton) / (SUM(sample_size * clinton) + SUM(sample_size * trump)) * 100.0 AS clinton, 
    SUM(sample_size * trump) / (SUM(sample_size * clinton) + SUM(sample_size * trump)) * 100.0 AS trump
    FROM polls
    WHERE state = :state
    AND start_date BETWEEN :start_date AND :end_date
    AND end_date BETWEEN :start_date AND :end_date
    """

    ret = db.engine.execute(text(q), state = state, start_date = start_date, end_date = end_date)
    ret = list(
        map(
            lambda row: {
                'clinton': row[0],
                'trump': row[1]
            }, 
            ret
        )
    )

    return jsonify({ 'results': ret })

@app.route('/api/v1/topics/favorable', methods = ['GET'])
def get_favorable_topics():
    state = request.args.get('state')
    candidate = request.args.get('candidate')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    q = """
    SELECT articles.topic, COUNT(*)
    FROM articles
    INNER JOIN topics ON topics.topic = articles.topic
    WHERE topics.%s_approves = \'y\' AND articles.state = :state AND articles.date BETWEEN :start_date AND :end_date
    GROUP BY articles.topic
    ORDER BY COUNT(*) DESC
    LIMIT 10
    """ % candidate

    ret = db.engine.execute(text(q), state = state, start_date = start_date, end_date = end_date)
    ret = list(
        map(
            lambda row: {
                'topic': row[0],
                'article_count': row[1]
            },
            ret
        )
    )

    return jsonify({ 'topics': ret })

@app.route('/api/v1/articles/favorable', methods = ['GET'])
def get_favorable_articles():
    candidate = request.args.get('candidate')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    state = request.args.get('state')

    q = """
    SELECT DISTINCT articles.*
    FROM articles
    INNER JOIN keywords AS k1 ON k1.article_id = articles.id
    WHERE articles.sentiment = 'positive' AND date BETWEEN :start_date AND :end_date
    """

    if state is not None:
        q += ' AND state = :state'

    # AND (k1.keyword = \'Clinton\' OR k1.keyword LIKE \'Hillary % Clinton%\')
    if candidate == 'clinton':
        q += """
         AND (k1.keyword LIKE \'Hillary %Clinton%\')
         AND NOT EXISTS (
            SELECT article_id
            FROM keywords AS k2
            WHERE k1.article_id = k2.article_id 
            AND (k2.keyword LIKE \'Trump%\' OR k2.keyword LIKE \'Donald %Trump%\')
        )
        """
    elif candidate == 'trump':
        q += """
         AND (k1.keyword LIKE \'Trump%\' OR k1.keyword LIKE \'Donald %Trump%\')
         AND NOT EXISTS (
            SELECT article_id
            FROM keywords AS k2
            WHERE k1.article_id = k2.article_id 
            AND (k2.keyword LIKE \'Clinton%\' OR k2.keyword LIKE \'Hillary %Clinton%\')
        )
        """

    q += ' ORDER BY articles.date ASC'
    ret = db.engine.execute(text(q), start_date = start_date, end_date = end_date, state = state)
    ret = list(
        map(
            lambda row: {
                'id': row[0],
                'date': row[1],
                'url': row[2],
                'source': row[3],
                'state': row[5],
                'title': row[6],
                'topic': row[7]
            },
            ret
        )
    )

    return jsonify({ 'favorable_articles': ret, 'count': len(ret) })
    
@app.route('/api/v1/articles', methods = ['GET'])
def get_articles():
    topic = request.args.get('topic')

    q = """
    SELECT *
    FROM articles
    WHERE topic = :topic
    """

    ret = db.engine.execute(text(q), topic = topic)
    ret = list (
        map(
            lambda row: {
                'id': row[0],
                'date': row[1],
                'url': row[2],
                'source': row[3],
                'sentiment': row[4],
                'state': row[5],
                'title': row[6],
                'topic': row[7]
            },
            ret
        )
    )

    return jsonify({ 'articles': ret })

@app.route('/api/v1/topics', methods = ['GET'])
def get_topics():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    q = """
    SELECT articles.topic, COUNT(*), clinton_approves, trump_approves
    FROM articles
    INNER JOIN topics ON topics.topic = articles.topic
    WHERE date BETWEEN :start_date AND :end_date
    GROUP BY articles.topic
    ORDER BY COUNT(*) DESC
    """

    ret = db.engine.execute(text(q), start_date = start_date, end_date = end_date)
    topics = list(
        map(
            lambda row: {
                'topic': row[0],
                'article_count': row[1],
                'clinton_approves': row[2],
                'trump_approves': row[3]
            },
            ret
        )
    )

    q = """
    SELECT SUM(sample_size * clinton) / (SUM(sample_size * clinton) + SUM(sample_size * trump)) * 100.0, SUM(sample_size * trump) / (SUM(sample_size * trump) + SUM(sample_size * trump)) * 100.0
    FROM polls
    WHERE start_date BETWEEN :start_date AND :end_date
    AND end_date BETWEEN :start_date AND :end_date
    """

    ret = db.engine.execute(text(q), start_date = start_date, end_date = end_date)
    poll = list(map(lambda row: {
        'clinton_win': row[0],
        'trump_win': row[1]
    }, ret))[0]

    return jsonify({ 'topics': topics, 'poll': poll })

@app.route('/api/v1/states/topics_approved', methods = ['GET'])
def get_states_for_candidate_winning_based_on_topics_approved():
    candidate = request.args.get('candidate')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    other_candidate = ''
    if candidate == 'clinton':
        other_candidate = 'trump'
    elif candidate == 'trump':
        other_candidate = 'clinton'

    q = """
    SELECT polls.state
    FROM polls
    INNER JOIN (
        SELECT state, COUNT(*) AS count
        FROM articles
        INNER JOIN topics on topics.topic = articles.topic
        WHERE sentiment = 'positive' AND topics.%s_approves = 'y' AND articles.date BETWEEN :start_date AND :end_date
        GROUP BY state
    ) AS pos_articles ON pos_articles.state = polls.state
    INNER JOIN (
        SELECT state, COUNT(*) AS count
        FROM articles
        INNER JOIN topics on topics.topic = articles.topic
        WHERE sentiment = 'negative' AND topics.%s_approves = 'y' AND articles.date BETWEEN :start_date AND :end_date
        GROUP BY state
    ) AS neg_articles ON neg_articles.state = polls.state
    WHERE pos_articles.count > neg_articles.count AND polls.start_date BETWEEN :start_date AND :end_date AND polls.end_date BETWEEN :start_date AND :end_date
    GROUP BY polls.state
    HAVING SUM(sample_size * %s) / (SUM(sample_size * clinton) + SUM(sample_size * trump)) > SUM(sample_size * %s) / (SUM(sample_size * clinton) + SUM(sample_size * trump));
    """ % (candidate, candidate, candidate, other_candidate)

    ret = db.engine.execute(text(q), start_date = start_date, end_date = end_date)
    states = list(map(lambda row: row[0], ret))

    return jsonify({ 'states': states })

@app.route('/api/v1/states', methods = ['GET'])
def get_states_for_candidate_winning():
    candidate = request.args.get('candidate')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    q = """
    SELECT DISTINCT polls.state 
    FROM polls
    INNER JOIN (
        SELECT state, COUNT(*) AS count 
        FROM articles 
        WHERE sentiment = 'positive' AND date BETWEEN :start_date AND :end_date
        GROUP BY state
    ) AS pos_articles ON pos_articles.state = polls.state 
    INNER JOIN (
        SELECT state, count(*) AS count 
        FROM articles 
        WHERE sentiment = 'negative' AND date BETWEEN :start_date AND :end_date
        GROUP BY state  
    ) AS neg_articles ON neg_articles.state = polls.state 
    WHERE pos_articles.count > neg_articles.count AND polls.start_date BETWEEN :start_date AND :end_date AND polls.end_date BETWEEN :start_date AND :end_date
    GROUP BY polls.state
    HAVING SUM(sample_size * %s) / (SUM(sample_size * clinton) + SUM(sample_size * trump)) > SUM(sample_size * %s) / (SUM(sample_size * clinton) + SUM(sample_size * trump))
    """ % (candidate, 'trump' if candidate == 'clinton' else 'clinton')
    #""" % ('<' if candidate == 'clinton' else '>')
    #GROUP BY polls.state; 

    ret = db.engine.execute(text(q), start_date = start_date, end_date = end_date)
    ret = list(map(lambda row: row[0], ret))

    return jsonify({ 'states': ret })

@app.route('/api/v1/topics/state')
def get_topics_for_states():
    state = request.args.get('state')

    q = """
    SELECT topic, COUNT(*) AS count
    FROM articles
    WHERE state = :state
    GROUP BY topic
    ORDER BY count DESC
    LIMIT 10
    """

    ret = db.engine.execute(text(q), state = state)
    ret = list(map(lambda row: {
        'topic': row[0],
        'count': row[1]
    }, ret))

    return jsonify({ 'topics': ret })

@app.route('/api/v1/articles/search')
def search_articles():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    topic = request.args.get('topic')
    state = request.args.get('state')

    q = """
    SELECT *
    FROM articles
    WHERE date BETWEEN :start_date AND :end_date
    AND topic = :topic
    """

    if state is not None:
        q += ' AND state = :state'

    q += ' ORDER BY date DESC'

    ret = db.engine.execute(text(q), start_date = start_date, end_date = end_date, topic = topic, state = state)
    ret = list(map(lambda row: {
        'id': row[0],
        'date': row[1],
        'url': row[2],
        'source': row[3],
        'sentiment': row[4],
        'state': row[5],
        'title': row[6],
        'topic': row[7]
    }, ret))

    return jsonify({ 'articles': ret, 'count': len(ret) })

@app.route('/api/v1/sources/candidate')
def get_top_sources_for_candidate():
    candidate = request.args.get('candidate')
    start_date = request.args.get('start_date') or '2016-01-01'
    end_date = request.args.get('end_date') or '2016-11-15'

    q = """
    SELECT articles.source
    FROM articles
    INNER JOIN keywords AS k1 ON k1.article_id = articles.id
    WHERE articles.date BETWEEN :start_date AND :end_date
    """

    if candidate == 'clinton':
        q += """
         AND (k1.keyword LIKE \'Hillary %Clinton%\')
         AND NOT EXISTS (
            SELECT article_id
            FROM keywords AS k2
            WHERE k1.article_id = k2.article_id 
            AND (k2.keyword LIKE \'Trump%\' OR k2.keyword LIKE \'Donald %Trump%\')
        )
        """
    elif candidate == 'trump':
        q += """
         AND (k1.keyword LIKE \'Trump%\' OR k1.keyword LIKE \'Donald %Trump%\')
         AND NOT EXISTS (
            SELECT article_id
            FROM keywords AS k2
            WHERE k1.article_id = k2.article_id 
            AND (k2.keyword LIKE \'Clinton%\' OR k2.keyword LIKE \'Hillary %Clinton%\')
        )
        """

    q += """
    GROUP BY articles.source
    ORDER BY COUNT(DISTINCT articles.id) DESC
    LIMIT 10
    """

    ret = db.engine.execute(text(q), start_date = start_date, end_date = end_date)
    ret = list(
        map(
            lambda row: {
                'source': row[0]
            },
            ret
        )
    )

    return jsonify({ 'sources': ret })

@app.route('/api/v1/sources/positive')
def get_top_positive_sources():
    start_date = request.args.get('start_date') or '2016-01-01'
    end_date = request.args.get('end_date') or '2016-11-15'

    q = """
    SELECT source
    FROM articles
    WHERE sentiment = 'positive' AND date BETWEEN :start_date AND :end_date
    GROUP BY source
    ORDER BY COUNT(*) DESC
    LIMIT 10
    """

    ret = db.engine.execute(text(q), start_date = start_date, end_date = end_date)
    ret = list(map(lambda row: row[0], ret))

    return jsonify({ 'sources': ret })

@app.route('/api/v1/sources/negative')
def get_top_negative_sources():
    start_date = request.args.get('start_date') or '2016-01-01'
    end_date = request.args.get('end_date') or '2016-11-15'

    q = """
    SELECT source
    FROM articles
    WHERE sentiment = 'negative' AND date BETWEEN :start_date AND :end_date
    GROUP BY source
    ORDER BY COUNT(*) DESC
    LIMIT 10
    """

    ret = db.engine.execute(text(q), start_date = start_date, end_date = end_date)
    ret = list(map(lambda row: row[0], ret))

    return jsonify({ 'sources': ret })

@app.route('/api/v1/states/source')
def get_top_state_sources():
    start_date = request.args.get('start_date') or '2016-01-01'
    end_date = request.args.get('end_date') or '2016-11-15'

    q = """
    SELECT state, COUNT(*), GROUP_CONCAT(source)
    FROM articles
    WHERE date BETWEEN :start_date AND :end_date
    GROUP BY state
    ORDER BY COUNT(*) DESC
    """

    ret = db.engine.execute(text(q), start_date = start_date, end_date = end_date)
    ret = list(map(lambda row: {
        'state': row[0],
        'count': row[1],
        'sources': row[2].split(',')
    }, ret))

    return jsonify({ 'states': ret })

@app.route('/api/v1/keywords/frequent')
def get_frequent_keywords():
    q = """
    SELECT keyword, COUNT(*)
    FROM keywords
    GROUP BY SUBSTRING(SOUNDEX(keyword), 1, 6)
    ORDER BY COUNT(*) DESC
    LIMIT 100
    """

    ret = db.engine.execute(text(q))
    ret = list(map(lambda row: {
        'keyword': row[0],
        'count': row[1]
    }, ret))

    return jsonify({ 'keywords': ret })
