import { ChangeEventHandler, MouseEventHandler, useCallback, useMemo, useState } from 'react'
import './App.css'

interface IState {
	Enabled: boolean;
	TgBotTokenValue: string;
	TgBotChatIDValue: string;
	WorkTimeValue: string;
	RelaxTimeValue: string;
	State: "work" | "relax";
}

class Model {
	protected state: IState = {
		Enabled: false,
		TgBotTokenValue: "",
		TgBotChatIDValue: "",
		WorkTimeValue: "25",
		RelaxTimeValue: "5",
		State: "work",
	};

	protected startTime = 0;

	public get Enabled() {
		return this.state.Enabled;
	}
	public get TgBotTokenValue(): string {
		return this.state.TgBotTokenValue;
	}
	public get TgBotChatIDValue(): string {
		return this.state.TgBotChatIDValue;
	}
	public get RelaxTimeValue(): string {
		return this.state.RelaxTimeValue;
	}
	public get WorkTimeValue(): string {
		return this.state.WorkTimeValue;
	}

	public get ButtonIcon(): string {
		if (this.Enabled) {
			return this.state.State === "relax" ? "self_improvement" : "timer_play";
		}

		return "pause";
	}
	public get StateLabel(): string {
		return !this.Enabled ? "Пауза" : this.state.State === "relax" ? "Отдых" : "Работаем";
	}
	public get RelaxTime(): number {
		return parseFloat(this.state.RelaxTimeValue) || 0;
	}
	public get WorkTime(): number {
		return parseFloat(this.state.WorkTimeValue) || 0;
	}

	constructor() {
		this.load();

		setInterval(this.tick, 700);
	}

	public SetState(state: IState): this {
		this.state = state;
		if (!((parseFloat(this.state.RelaxTimeValue)) >= 1)) {
			this.state.RelaxTimeValue = "1";
		}
		this.save();
		this.update();

		return this;
	}
	public UpdateState(state: Partial<IState>): this {
		return this.SetState({
			...this.state,
			...state,
		});
	}

	public TgBotTokenHandler: ChangeEventHandler<HTMLInputElement> = (event) => {
		this.UpdateState({
			TgBotTokenValue: event.target.value,
		});
	};
	public TgBotChatIDHandler: ChangeEventHandler<HTMLInputElement> = (event) => {
		this.UpdateState({
			TgBotChatIDValue: event.target.value,
		});
	};
	public WorkTimeHandler: ChangeEventHandler<HTMLInputElement> = (event) => {
		this.UpdateState({
			WorkTimeValue: event.target.value,
		});
	};
	public RelaxTimeHandler: ChangeEventHandler<HTMLInputElement> = (event) => {
		this.UpdateState({
			RelaxTimeValue: event.target.value,
		});
	};
	public ToggleHandler: MouseEventHandler = (event) => {
		event.preventDefault();

		const Enabled = !this.Enabled;
		this.UpdateState({
			Enabled,
		});
		this.startTime = Enabled ? Date.now() : 0;
	};

	protected tick = () => {
		if (!this.Enabled || !this.startTime) {
			return;
		}
	};

	protected save(): void {
		localStorage.setItem("form", JSON.stringify(this.state));
	}
	protected load(): void {
		this.UpdateState({
			...JSON.parse(localStorage.getItem("form") || "{}"),
			Enabled: false,
		});
	}

	/** @deprecated protected */
	public update = (): void => void 0;
}

function App() {
	const [,update] = useState(Symbol(Date.now()));
	const model = useMemo(() => new Model(), []);
	model.update = useCallback(() => {
		update(Symbol(Date.now()));
	}, []);

	const {
		Enabled,
		TgBotTokenValue,
		TgBotChatIDValue,
		WorkTimeValue,
		RelaxTimeValue,
		StateLabel,
		ButtonIcon,

		TgBotTokenHandler,
		TgBotChatIDHandler,
		WorkTimeHandler,
		RelaxTimeHandler,
		ToggleHandler,
	} = model;

	return (
		<div className="App" data-enabled={ Enabled }>
			<h1>Pomadoro</h1>

			<fieldset className="grid">
				<label className="Field">
					<span>Bot Token</span>
					<input type="text" value={TgBotTokenValue} onChange={ TgBotTokenHandler } />
				</label>
				<label className="Field">
					<span>Chat ID</span>
					<input type="text" value={TgBotChatIDValue} onChange={ TgBotChatIDHandler }  />
				</label>
			</fieldset>

			<fieldset className="grid">
				<label className="Field">
					<span>Время работы</span>
					<input type="number" min="1" max="60" value={WorkTimeValue} onChange={ WorkTimeHandler }  />
				</label>
				<label className="Field">
					<span>Время отдыха</span>
					<input type="number" min="1" max="60" value={RelaxTimeValue} onChange={ RelaxTimeHandler }  />
				</label>
			</fieldset>
			<article>
				{ StateLabel }
			</article>
			<p>
				<progress value="90" max="100" />
				01:02 | 03:04
			</p>
			<button
				className="ToggleButton"
				onClick={ ToggleHandler }
			>
				<span className="material-symbols-outlined" data-icon={ ButtonIcon }></span>
			</button>
		</div>
	);
}

export default App
