export default interface TracerLogInterface {
    /**
     * Save file
     * @public {boolean} save_file - Save file
     */
    save_file: boolean;

    /**
     * Limit log array before save
     * @public {number} limit - Limit log array
     */
    limit: number;

    /**
     * Console log
     * @public {boolean} console - Console log
     */
    console: boolean;

    /**
     * Get log array
     * @returns {string[]} Log array
     */
    data: object[];

    /**
     * Clear log array
     * @returns {void}
     */
    clear(): Promise<void>;

    log(message: any): Promise<void>

    warn(message: any): Promise<void>

    error(message: any): Promise<void>

    debug(message: any): Promise<void>

    info(message: any): Promise<void>

    saveNow(message: any): Promise<void>

    init(): Promise<void>
}