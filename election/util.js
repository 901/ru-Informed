function getFormattedDate(date) {
  var year = date.getFullYear();
  var month = (1 + date.getMonth()).toString();
  month = month.length > 1 ? month : '0' + month;
  var day = date.getDate().toString();
  day = day.length > 1 ? day : '0' + day;
  return year + '-' + month + '-' + day;
}

function getFormattedUrl(endpoint, keys, values){
    var url = "https://limitless-taiga-13414.herokuapp.com/api/v1/" + endpoint + "?";
    var param = "";

    for (var i = 0; i < keys.length; ++i){
        param += keys[i] + "=" + values[i];
        if (i + 1 != keys.length)
            param += "&";
    }

    return url + param;
}

const statesHash = {
    'alabama': 'AL',
    'alaska': 'AK',
    'arizona': 'AZ',
    'arkansas': 'AR',
    'california': 'CA',
    'colorado': 'CO',
    'connecticut': 'CT',
    'delaware': 'DE',
    'washington d.c.': 'DC',
    'florida': 'FL',
    'georgia': 'GA',
    'hawaii': 'HI',
    'idaho': 'ID',
    'illinois': 'IL',
    'indiana': 'IN',
    'iowa': 'IA',
    'kansas': 'KS',
    'kentucky': 'KY',
    'louisiana': 'LA',
    'maine': 'ME',
    'maryland': 'MD',
    'massachusetts': 'MA',
    'michigan': 'MI',
    'minnesota': 'MN',
    'mississippi': 'MS',
    'missouri': 'MO',
    'montana': 'MT',
    'nebraska': 'NE',
    'nevada': 'NV',
    'new hampshire': 'NH',
    'new jersey': 'NJ',
    'new mexico': 'NM',
    'new york': 'NY',
    'north carolina': 'NC',
    'north dakota': 'ND',
    'ohio': 'OH',
    'oklahoma': 'OK',
    'oregon': 'OR',
    'pennsylvania': 'PA',
    'rhode island': 'RI',
    'south carolina': 'SC',
    'south dakota': 'SD',
    'tennessee': 'TN',
    'texas': 'TX',
    'utah': 'UT',
    'vermont': 'VT',
    'virginia': 'VA',
    'washington': 'WA',
    'west virginia': 'WV',
    'wisconsin': 'WI',
    'wyoming': 'WY'
};

const statesElectoralVotes = {
    'alabama': 9,
    'alaska': 3,
    'arizona': 11,
    'arkansas': 6,
    'california': 55,
    'colorado': 9,
    'connecticut': 7,
    'delaware': 3,
    'washington d.c.': 3,
    'florida': 29,
    'georgia': 16,
    'hawaii': 4,
    'idaho': 4,
    'illinois': 20,
    'indiana': 11,
    'iowa': 6,
    'kansas': 6,
    'kentucky': 8,
    'louisiana': 8,
    'maine': 4,
    'maryland': 10,
    'massachusetts': 11,
    'michigan': 16,
    'minnesota': 10,
    'mississippi': 6,
    'missouri': 10,
    'montana': 3,
    'nebraska': 5,
    'nevada': 6,
    'new hampshire': 4,
    'new jersey': 14,
    'new mexico': 5,
    'new york': 29,
    'north carolina': 15,
    'north dakota': 3,
    'ohio': 18,
    'oklahoma': 7,
    'oregon': 7,
    'pennsylvania': 20,
    'rhode island': 4,
    'south carolina': 9,
    'south dakota': 3,
    'tennessee': 11,
    'texas': 38,
    'utah': 6,
    'vermont': 3,
    'virginia': 13,
    'washington': 12,
    'west virginia': 5,
    'wisconsin': 10,
    'wyoming': 3
};
