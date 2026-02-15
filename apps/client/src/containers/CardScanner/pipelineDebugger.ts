/**
 * Pipeline debugger for visualizing intermediate steps
 * Shows the output of each pipeline step in a gallery with navigation
 */

interface PipelineDebugFrame {
  stepName: string;
  mat: any; // OpenCV Mat
}

export class PipelineDebugger {
  private debugContainer: HTMLDivElement;
  private frames: PipelineDebugFrame[] = [];
  private currentFrameIndex = 0;
  private canvasDisplay: HTMLCanvasElement | null = null;
  private navContainer: HTMLDivElement | null = null;

  constructor(container: HTMLDivElement) {
    this.debugContainer = container;
    this.setupContainer();
  }

  private setupContainer() {
    this.debugContainer.style.display = 'flex';
    this.debugContainer.style.flexDirection = 'column';
    this.debugContainer.style.gap = '10px';

    // Create canvas display
    this.canvasDisplay = document.createElement('canvas');
    this.canvasDisplay.style.border = '2px solid #ccc';
    this.canvasDisplay.style.maxWidth = '100%';
    this.canvasDisplay.style.height = 'auto';
    this.debugContainer.appendChild(this.canvasDisplay);

    // Create navigation container
    this.navContainer = document.createElement('div');
    this.navContainer.style.display = 'flex';
    this.navContainer.style.gap = '10px';
    this.navContainer.style.alignItems = 'center';
    this.navContainer.style.justifyContent = 'center';
    this.debugContainer.appendChild(this.navContainer);
  }

  /**
   * Add a frame from a pipeline step for debugging
   * @param stepName Name of the pipeline step
   * @param mat OpenCV Mat containing the output
   */
  addFrame(stepName: string, mat: any) {
    this.frames.push({ stepName, mat });
  }

  /**
   * Render the debugger UI with all collected frames
   */
  render() {
    if (this.frames.length === 0) {
      console.warn('No frames collected for pipeline debugging');
      return;
    }

    this.renderNavigation();
    this.showFrame(this.frames.length - 1);
  }

  private renderNavigation() {
    if (!this.navContainer) return;

    this.navContainer.innerHTML = '';

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '← Previous';
    prevBtn.style.padding = '8px 12px';
    prevBtn.onclick = () => this.previousFrame();
    this.navContainer.appendChild(prevBtn);

    // Step indicator
    const indicator = document.createElement('span');
    indicator.style.minWidth = '200px';
    indicator.style.textAlign = 'center';
    indicator.style.fontWeight = 'bold';
    this.navContainer.appendChild(indicator);

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next →';
    nextBtn.style.padding = '8px 12px';
    nextBtn.onclick = () => this.nextFrame();
    this.navContainer.appendChild(nextBtn);

    // Update indicator
    this.updateIndicator(indicator);
  }

  private updateIndicator(indicator: HTMLSpanElement) {
    const current = this.frames[this.currentFrameIndex];
    indicator.textContent = `Step ${this.currentFrameIndex + 1}/${this.frames.length}: ${current.stepName}`;
  }

  private showFrame(index: number) {
    if (index < 0 || index >= this.frames.length) {
      return;
    }

    this.currentFrameIndex = index;
    const frame = this.frames[index];

    if (this.canvasDisplay) {
      this.canvasDisplay.width = frame.mat.cols;
      this.canvasDisplay.height = frame.mat.rows;
      cv.imshow(this.canvasDisplay, frame.mat);
    }

    // Update indicator
    const indicator = this.navContainer?.querySelector('span');
    if (indicator instanceof HTMLSpanElement) {
      this.updateIndicator(indicator);
    }
  }

  private previousFrame() {
    if (this.currentFrameIndex > 0) {
      this.showFrame(this.currentFrameIndex - 1);
    }
  }

  private nextFrame() {
    if (this.currentFrameIndex < this.frames.length - 1) {
      this.showFrame(this.currentFrameIndex + 1);
    }
  }

  /**
   * Clear all collected frames and reset
   */
  clear() {
    this.frames.forEach((frame) => {
      if (frame.mat && frame.mat.delete) {
        frame.mat.delete();
      }
    });
    this.frames = [];
    this.currentFrameIndex = 0;
  }
}
