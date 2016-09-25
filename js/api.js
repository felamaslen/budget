/**
 * api methods
 */
function Api() {
  var apiUrl = "rest.php?t=";
}

Api.prototype.request = function(
  path,
  type,
  params,
  apiKey,
  success,
  error,
  complete
) {
  $.ajax({
    url: apiUrl + path,
    type: type,
    dataType: "json",
    data: params,
    beforeSend: function(xhr) {
      if (apiKey) {
        xhr.setRequestHeader("Authorization", apiKey);
      }
    },
    success: function(data) {
      if (data && data.error === false) {
        success(data.data);
      }
      else {
        console.warn("API error: " + errorText);
        error(data.errorText);
      }
    },
    error: function() {
      console.warn("General API error!");
    },
    complete: complete
  });
}

var api = new Api();
