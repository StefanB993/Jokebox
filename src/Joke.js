export default class Joke {
  constructor(obj) {
    this.id = obj?.id || 0;
    this.setup = obj?.setup || "";
    this.punchline = obj?.punchline || "";
    this.bookmarked = obj?.bookmarked || false;
    this.rating = obj?.rating || 1;
  }
}
