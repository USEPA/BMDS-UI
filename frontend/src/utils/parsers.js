export const ParseError = function(error) {
    let _error = error[0];
    console.error(_error);
    _error = _error.match(/(?<=ValueError:\s).*/)[0];
    return _error.toString();
};
