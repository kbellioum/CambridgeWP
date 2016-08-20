function supprimer(url) {
  return new Promise(function(success,error){
    $.ajax({
      url:url,
      type: 'DELETE',
      success,
      error
    });
  });
}

function add(url) {
  return new Promise(function(success,error){
    $.ajax({
      url:url,
      type: 'POST',
      success,
      error
    });
  });
}

function update(url) {
  return new Promise(function(success,error){
    $.ajax({
      url:url,
      type: 'PUT',
      success,
      error
    });
  });
}


function get(url) {
  return new Promise(function(success,error){
    $.ajax({
      url:url,
      type: 'GET',
      success,
      error
    });
  });
}
