export const parseError = function(error) {
    console.error(`Complete stacktrace:\n\n ${error}`);
    let _error = error[0].match(/(?<=ValueError:\s).*/);
    return _error.toString();
};
