const VAR_PATTERN = /\${([^}]*)}/g

export default class Interpolator {
    static interpolate(message, vars) {
        // turn the message into a string
        let stringifiedMessage = JSON.stringify(message);
        // find any variable in the message
        const matches = stringifiedMessage.match(VAR_PATTERN);

        // if there are no variables return the original message
        if (!matches) {
            return message;
        }

        // if there are variables, resolve them
        matches.forEach((match) => {
            // find the matching variable value
            const value = vars[match.substring(2, match.length - 1)];
            // throw when the variable does not exist in the context yet
            if (value === null || value === undefined) {
                throw new Error(`variable ${match} not found in context`);
            }
            stringifiedMessage = stringifiedMessage.replace(match, value);
        });

        // return interpolated message
        return JSON.parse(stringifiedMessage);
    }
}