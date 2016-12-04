function getFormattedDate(date) {
  var year = date.getFullYear();
  var month = (1 + date.getMonth()).toString();
  month = month.length > 1 ? month : '0' + month;
  var day = date.getDate().toString();
  day = day.length > 1 ? day : '0' + day;
  return year + '/' + month + '/' + day;
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
