import Interpolator from "../data/Interpolator";
import Step from "../data/Step";

function verify(received, step, sequence, websocket) {
	try {
		step.verify(sequence, received, websocket);
		sequence.processedSteps.push(step);
	} catch (error) {
		sequence.clear(websocket, error.message);
	}
}
export default class Sequence {
	steps
	processedSteps
	timeout
	lock
	description
	processingStep
	observable
	dashboard
	constructor(dashboard, sequence) {
		if (!sequence.description) {
			throw new Error('sequence requires non empty description field');
		}
		this.description = sequence.description;
		this.timeout = sequence.$timeout;
		this.vars = {};
		this.lock = false;
		this.processedSteps = [];

		this.steps = sequence.steps.map((step) => {
			return new Step(step);
		});

		this.processingStep = this.steps.shift();
		dashboard.connection.add(this);
		this.observable = null;
		this.dashboard = dashboard;
	}

	executeOn(websocket) {
		try {
			if (this.processingStep && this.processingStep.message) {
				const envVariables = this.dashboard.environment.variables;
				const objEnvVariables = envVariables ? JSON.parse(envVariables) : {};
				websocket.sendMessage(Interpolator.interpolate(this.processingStep.message, Object.assign(objEnvVariables, this.dashboard.context, this.vars)));
			}

			if (!this.steps.length && !this.processingStep) {
				websocket.remove(this);
				this.observable(this);
			}   
		} catch (error) {
			this.clear(websocket, error.message);
		}
	}

	update(websocket) {
		const received = JSON.parse(websocket.messages[0].data);
		verify(received, this.processingStep, this, websocket);

		if (this.steps.length) {
				this.processingStep = this.steps.shift();
		} else {
				this.processingStep = null;
		}

		this.executeOn(websocket);
	}

	clear(websocket, errorMessage) {
		websocket.remove(this);
		this.observable(this, errorMessage);
	}

	getReport() {
		return {
			description: `>>> ${this.description} <<<`,
			steps: this.processedSteps.map((step) => {
				return step.getReport();
			}).reverse()
		};
	}

	register(observable) {
		this.observable = observable;
	}
}