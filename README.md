# Argos3

A websocket testing environment

- [Argos3](#argos3)
  - [Project setup](#project-setup)
    - [Compiles and hot-reloads for development](#compiles-and-hot-reloads-for-development)
  - [Setup](#setup)
    - [Environment Configuration](#environment-configuration)
    - [Theme](#theme)
    - [Enable Updates Notification](#enable-updates-notification)
    - [Sending a message](#sending-a-message)
    - [Saving a message](#saving-a-message)
    - [Export and Import saved messages](#export-and-import-saved-messages)
    - [Variable Interpolation](#variable-interpolation)
    - [Argos sequence](#argos-sequence)
    - [Sequence cheatsheet](#sequence-cheatsheet)

## Project setup
```
npm install
```
### Compiles and hot-reloads for development
```
npm run electron:serve
```

## Setup

### Environment Configuration

To configure an Environment, navigate to the settings page under the environment tab. Click the `+` button then edit to specify the required fields:

**name**: the name that identifies the environment. You will be able to select an environment by name in your dashboard.

**url**: the url of the websocket endpoint that you would like to connect to.

**message required field**: this is a field in your message payload that is used to identify a websocket message. The default value is set to `type`.

Argos3 supports testing graphql apis. You can create an environment of type graphql then pass your graphql endpoint to it.

You can also define environment variables using the provided json editor. Environemnt variables will be available in the dashboard and can be accessed via [variable interpolation](#variable-interpolation). To save your email as a variable for instance you will have:

```json
{
  "email": "my.email@pearson.com"
}
```

The variable will be accessible via `${email}`.

### Theme

You can configure a light or dark theme, as well as changing the main color and the editor color scheme. To do so, navigate to the settings page and under the `Theme` tab select any of the available option.

### Enable Updates Notification

Argos is a work in progress. You can enable updates notification by navigating to the settings page under the `updates` tab. Hit the switch to enable notification updates. You will need to enter your gitlab token. Make sure the token has repository read permission. It is good practice to expire your token after some time and rotate them. You can manually check for updates in this page, or if you have enable the notification update you will see a notification badge everytime you navigate to the dashboard in the top right corner.

### Sending a message

To send a message, just enter your message payload and hit the paper plane button to send.

### Saving a message

Once you enter your message payload in your dashboard editor, you can save the message for later use. Saved messages can be accessed by clicking the six squares icon in the `Messages` panel on the left. Messages are saved against an environemnt, so they won't be available on a different environment.
### Export and Import saved messages

You can share your messages using the import/export functionality. Navigate to the settings page under the `environments` tab. Hit the folder icon to get presented with the option of importing or exporting messages.

### Variable Interpolation

You can create temporary variables in your dashboard using the editor under the `Messages` panel on the left. For instance:

```json
{
  "name": "messageOne",
  "number": 1
}
```

Will allow you to send a message with variable interpolation:

```json
{
  "myMessage": "${name}",
  "number": "${number}"
}
```

will send the following message:

```json
{
  "myMessage": "messageOne",
  "number": 1
}
```

There are three contexts in which a variable can be defined:

- The Environment configurations
- The json editor under the `Messages` panel on the left
- Inside a sequence, see [Argos sequence](#argos-sequence)

If you define a variable with the same name this is how it works, imagine:

You have saved this in your environemnt configuration:

```json
{
  "email": "my.email@pearson.com"
}
```

and you have a sequence that defines the same variable name:

```json
{
  "email": "another.email@pearson.com"
}
```

When interpolating with `${email}`, the sequence takes precedence over the environemnt variable, so you will get `another.email@pearson.com`.

Finally if you also have defined a variable in the dashboard json editor:

```json
{
  "email": "my.final.email@pearson.com"
}
```

When interpolating with `${email}` you will get `my.final.email@pearson.com`. The json editor overrides values from sequences and environment variables.

### Argos sequence

Sometimes it is useful to run a series of messages in sequence to test a particular funcionality. A **Sequence** is a series of **Steps** each **Step** has a series of **Verifications**.

When running a sequence each step will be executed synchronously and in order. All you need to start a sequence is:

```json
{
  "$argos": "sequence",
  "description": "An empty sequence",
  "steps": []
}
```

to define a step to send a message you need:

```json
{
  "description": "My first step",
  "message": {
    "type": "ping"
  },
  "verifications": []
}
```

Now you have the following sequence:

```json
{
  "$argos": "sequence",
  "description": "An empty sequence",
  "steps": [
    {
      "description": "My first step",
      "message": {
        "type": "ping"
      },
      "verifications": []
    }
  ]
}
```

This will send a ping message. To make it more useful we can start adding verifications. A verification is a way to validate what happens next on the websocket connection. Let's add the following verification to the sequence above:

```json
{
  "description": "It should respond with pong",
  "type": "PATH",
  "path": "type",
  "value": "pong",
  "save": {
    "value": false
  }
}
```

The above verifications uses a type `PATH`, this is the only type supported at this stage.

- `path` defines which value in the json response you want to validate.
- `value` defines the value that you are expeting to receive.
- `save` tells the sequence if this value should be saved as a variable, in this case we don't need to.

The complete sequence looks like this:

```json
{
  "$argos": "sequence",
  "description": "An empty sequence",
  "steps": [
    {
      "description": "My first step",
      "message": {
        "type": "ping"
      },
      "verifications": [{
        "description": "It should respond with pong",
        "type": "PATH",
        "path": "type",
        "value": "pong",
        "save": {
          "value": false
        }
      }]
    }
  ]
}
```

In the websocket world sometimes you might don't want to send a message but only expect to receive one. For that you can declare a step with a null message like so:

```json
  {
    "message": null,
    "verifications": [
      {
        "type": "PATH",
        "path": "type",
        "value": "author.export.broadcast",
        "save": {
          "value": false
        }
      }
    ]
  }
```

The above step will not send any message, it will instead expect to receive a message back where the `type` is `author.export.broadcast`.

If the value you are expecting is a dynamic value you can use the `@any()@` keyword. This keyword will merely validate that the value is defined.

You can have as many steps and verifications as you like, just rememebr that `description` is a required field for a `sequence`, a `step` and a `verification`. Sequences can be saved just like messages! So you can re-use them in the future.

Here is another sequence example that performs authentication via email and then bearer token with the mercury backend:

```json
{
  "$argos": "sequence",
  "description": "Local Authentication Test",
  "steps": [
    {
      "description": "Authenticate via email and password",
      "message": {
        "type": "authenticate",
        "email": "${email}",
        "password": "${password}"
      },
      "verifications": [
        {
          "description": "It should authenticate the user",
          "type": "PATH",
          "path": "type",
          "value": "authenticate.ok",
          "save": {
            "value": false
          }
        },
        {
          "description": "It should save the bearer token",
          "type": "PATH",
          "path": "response.bearerToken",
          "value": "@any()@",
          "save": {
            "value": true,
            "name": "bearerToken"
          }
        }
      ]
    },
    {
      "description": "authenticate with bearer token",
      "message": {
        "type": "authenticate",
        "bearerToken": "${bearerToken}"
      },
      "verifications": [
        {
          "description": "It should authenticate the user via bearer token",
          "type": "PATH",
          "path": "type",
          "value": "authenticate.ok",
          "save": {
            "value": false
          }
        },
        {
          "description": "It should save the bearer token",
          "type": "PATH",
          "path": "response.bearerToken",
          "value": "@any()@",
          "save": {
            "value": true,
            "name": "bearerToken"
          }
        }
      ]
    }
  ]
}
```

### Sequence cheatsheet

Coming soon!
