import TracerLogInterface from "./tracer_log_interface.ts";

/**
 * TracerLog class
 */
export default class TracerLog implements TracerLogInterface {
    /**
     * Log array
     * @private {string[]} _log - Log array
     */
    #_log: object[] = [];

    /**
     * Init
     * @private {boolean} _init - Check if was initialized
     */
    #_init: boolean = false;

    /**
     * Console proxy
     * @public {any} consoleProxy - Console proxy
     */
    public consoleProxy: any = null;
    /**
     * Original console
     * @public {any} originalConsole - Original console
     */
    public originalConsole: any = null;

    /**
     * Save file
     * @public {boolean} save_file - Save file
     */
    public save_file: boolean = false;

    /**
     * Limit log array before save
     * @public {number} limit - Limit log array
     */
    public limit: number = 300;

    /**
     * Console log
     * @public {boolean} console - Console log
     */
    public console: boolean = false;

    /**
     * Init
     * @returns {Promise<void>}
     */
    public async init(): Promise<void> {
        if (this.#_init) {
            return;
        }
        this.addListener();
        this.originalConsole = window.console;
        let this1 = this;
        window.console = new Proxy(this.originalConsole, {
            get: function (target, prop, receiver) {
                // Intercepta el acceso a los métodos de la consola
                // @ts-ignore
                if (typeof target[prop] === 'function') {
                    return function (...args: any[]) {
                        switch (prop) {
                            case "log":
                                this1.log(args).then(() => {
                                });
                                break;
                            case "warn":
                                this1.warn(args).then(() => {
                                });
                                break;
                            case "error":
                                this1.error(args).then(() => {
                                });
                                break;
                            case "debug":
                                this1.debug(args).then(() => {
                                });
                                break;
                            default:
                                this1.info(args).then(() => {
                                });
                                break;
                        }

                        // Llama al método original de la consola
                        // @ts-ignore
                        if (this1.console) {
                            return Reflect.apply(target[prop], target, args);
                        }
                    };
                } else {
                    // Si no es un método, simplemente devuelve la propiedad original
                    return Reflect.get(target, prop, receiver);
                }
            }
        });
        this.#_init = true;
    }

    /**
     * Add listener
     * @private
     * @returns {void}
     */
    private addListener(): void {
        // @ts-ignore
        window.addEventListener("beforeunload", async (): Promise<void> => {
            await this.info("beforeunload");
            await this.save(JSON.stringify(this.#_log));
        });
    }

    /**
     * Get log array
     * @returns {string[]} Log array
     */
    public get data(): object[] {
        return this.#_log;
    }

    /**
     * Clear log array
     * @returns {void}
     */
    public async clear(): Promise<void> {
        this.#_log = [];
    }

    /**
     * Trace message
     * @param {string} type - Type of message in "log", "warn", "error", "debug"
     * @param {any} message - Message to trace
     * @private
     * @returns {Promise<object>} Traced message
     */
    private async trace(type: string, message: any): Promise<object> {
        let r: any = null;
        let error: Error = new Error();
        try {
            error.name = type;
            error.message = JSON.stringify(message);
        } catch (e: any) {
            r = e;
        } finally {
            if (r === null) {
                r = error;
            }
        }
        let d: { __trace__: string[] | null, info: any, type: string } = {
            __trace__: r ? (r.stack.toString()).split("\n    ") : null,
            info: message,
            type: type,
        };

        await this.addConsoleData(d);
        //await this.show(type, message);
        return d;
    }

    /**
     * Pad number
     * @param {number} num - Number to pad
     * @param {number} size - Size of pad
     * @private
     * @returns {string} Padded number
     */
    private pad(num: number, size: number): string {
        let s: string = num + "";
        while (s.length < size) s = "0" + s;
        return s;
    }

    /**
     * Get time
     * @private
     * @returns {{unix: number, date: string, time: string, uri: string}} Time object
     */
    private getTime(): { unix: number, date: string, time: string, uri: string } {
        let date: Date = new Date();
        let unix_time: number = date.getTime();//unix
        let day: string = this.pad(date.getDate(), 2);//day
        let year: number = date.getFullYear();//year
        let month: string = this.pad(date.getMonth() + 1, 2);
        let hours: string = this.pad(date.getHours(), 2);
        let minutes: string = this.pad(date.getMinutes(), 2);
        let seconds: string = this.pad(date.getSeconds(), 2);
        let milliseconds: number = date.getMilliseconds();
        let host: URL = new URL(window?.location.toString() ?? '');
        return {
            unix: unix_time,
            date: year + "-" + month + "-" + day,
            time: hours + ":" + minutes + ":" + seconds + "." + milliseconds,
            uri: host.href
        };
    }

    /**
     * Add console data
     * @param {{__trace__: string[] | null, info: any, type: string}} data - Data to add
     * @private
     * @returns {Promise<void>}
     */
    private async addConsoleData(data: { __trace__: string[] | null, info: any, type: string }): Promise<void> {
        let time_obj: { unix: number, date: string, time: string, uri: string } = this.getTime();
        let obj: {
            type: string,
            object: { __trace__: string[] | null, info: any, type: string },
            date: { unix: number, date: string, time: string, uri: string }
        } = {
            type: data.type,
            object: data,
            date: time_obj,
        };
        this.#_log.push(obj);

        if (this.#_log.length >= this.limit) {
            await this.save(JSON.stringify(this.#_log));
            this.#_log = [];
        }
    }

    /**
     * Save
     * @param {string} data - Data to save
     * @private
     * @returns {Promise<void>}
     */
    private async save(data: string): Promise<void> {
        this.dispatchSave(data);
        this.toFile(data);
    }

    /**
     * Dispatch save event
     * @param {string} logs - Logs to save
     * @private
     * @returns {void}
     */
    private dispatchSave(logs: string): void {
        document.dispatchEvent(new CustomEvent("console:save", {
            detail: {logs},
        }));
    }

    /**
     * Save to file
     * @param {string} data - Data to save
     * @private
     * @returns {void}
     */
    private toFile(data: string): void {
        if (this.save_file) {
            let blob: Blob = new Blob([data], {type: "text/plain;charset=utf-8"});
            let url: string = URL.createObjectURL(blob);
            let a: HTMLAnchorElement = document.createElement("a");
            a.href = url;
            a.download = `log_${((new Date).getTime())}.json`;
            a.click();
        }
    }

    /**
     * Add message to log array
     * @param {any} message - Message to add
     * @returns {Promise<void>}
     */
    public async log(message: any): Promise<void> {
        await this.trace("log", message);
    }

    /**
     * Add message to log array
     * @param {any} message - Message to add
     * @returns {Promise<void>}
     */
    public async warn(message: any): Promise<void> {
        await this.trace("warn", message);
    }

    /**
     * Add message to log array
     * @param {any} message - Message to add
     * @returns {Promise<void>}
     */
    public async error(message: any): Promise<void> {
        await this.trace("error", message);
    }

    /**
     * Add message to log array
     * @param {any} message - Message to add
     * @returns {Promise<void>}
     */
    public async debug(message: any): Promise<void> {
        await this.trace("debug", message);
    }

    /**
     * Add message to log array
     * @param {any} message - Message to add
     * @returns {Promise<void>}
     */
    public async info(message: any): Promise<void> {
        await this.trace("info", message);
    }

    /**
     * Save now, force save
     * @returns {Promise<void>}
     */
    public async saveNow(): Promise<void> {
        await this.info("saveNow");
        await this.save(JSON.stringify(this.#_log));
        this.#_log = [];
    }
}