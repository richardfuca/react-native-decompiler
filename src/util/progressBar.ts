import CliProgress from 'cli-progress';

export default class ProgressBar {
  private static instance?: ProgressBar;
  private progressBar = new CliProgress.SingleBar({ etaBuffer: 200 }, CliProgress.Presets.shades_classic);

  static getInstance(): ProgressBar {
    if (!this.instance) {
      this.instance = new ProgressBar();
    }
    return this.instance;
  }

  private constructor() {}

  /**
   * Starts the progress bar and set the total and initial value
   * @param startValue The initial value
   * @param total The max value
   */
  start(startValue: number, total: number): void {
    this.progressBar.start(total, startValue);
  }

  /**
   * Increments the progress bar
   * @param amount The amount to increment, default = 1
   */
  increment(amount?: number): void {
    this.progressBar.increment(amount);
  }

  /**
   * Stops the progress bar
   */
  stop(): void {
    this.progressBar.stop();
  }
}
