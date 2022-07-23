export function myHTTP() {
  return {
    get(url, cb) {
      let xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.addEventListener("load", () => {
        if (!(xhr.status <= 204 && xhr.status >= 200)) {
          cb(`error.statusCode ${xhr.status}`, xhr);
          return;
        }
        let response = JSON.parse(xhr.responseText);
        cb(null, response);
      });
      xhr.send();
    },
  };
}
