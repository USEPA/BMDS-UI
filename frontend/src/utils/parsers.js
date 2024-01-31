export const parseError = function(error) {
    console.error(`Complete stacktrace:\n\n ${error}`);
    let _error = error.match(/(?<=ValueError:\s).*/)[0];
    return _error.toString();
};
