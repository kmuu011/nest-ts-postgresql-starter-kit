export abstract class BaseController {
  protected sendSuccess() {
    return { result: true };
  }
}