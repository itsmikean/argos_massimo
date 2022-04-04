
function affirmExpression(expression, message) {
	if (!expression) {
		throw new Error(`expectation failed: ${message}`);
	}
}

export default class Step {
  expectedVerifications
  actualVerifications
  description
  message

  constructor(step) {
    // make sure a description is defined for this step
    if (!step.description) {
      throw new Error(`step requires non empty description field`)
    }
    this.description = step.description;
    this.expectedVerifications = step.verifications;
    this.actualVerifications = [];
    this.message = step.message;

    // make sure the description is defined on each verification
    step.verifications.forEach((verification) => {
      if (!verification.description) {
          throw new TypeError(`verification requires non empty description for step ${this.description}`);
      }
  });
  }

  verify(sequence, received, websocket) {
    try {
      for (let i = 0; i < this.expectedVerifications.length; i++) {
          const verification = this.expectedVerifications[i];
  
          // for now assume the type is always PATH
          const keys = verification.path.split('.');
          let position = received;
  
          // find the wanted position in the json
          for (let j = 0; j < keys.length; j++) {
              const key = keys[j];
              position = position[key];
  
              if (position === null || position === undefined) {
                  throw new Error(`Verification failed: ${verification.description}`);
              }
          }
  
          // verify the position value
          if (verification.value === '@any()@') {
              affirmExpression((position !== null && position !== undefined), `verification ${JSON.stringify(verification)} failed; actual value ${position}`);
          } else {
              affirmExpression(position === verification.value, `verification ${JSON.stringify(verification)} failed; actual value ${position}`);
          }
  
          // save the position value if required
          if (verification.save.value) {
              sequence.vars[verification.save.name] = position;
          }
          this.actualVerifications.push(verification);
      }
    } catch (error) {
        sequence.clear(websocket, error.message);
    }
  }

  getReport() {
    return {
      description: this.description,
      passed: this.actualVerifications.length === this.expectedVerifications.length,
      message: `Passed verifications ${this.actualVerifications.length}/${this.expectedVerifications.length}`,
      verifications: this.actualVerifications.reverse()
    }
  }
}