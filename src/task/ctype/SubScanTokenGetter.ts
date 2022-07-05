export class SubScanTokenGetter {
  index = 0;

  tokens: string[];

  constructor(tokens: string[]) {
    this.tokens = tokens;
  }

  getToken() {
    const currentToken = this.tokens[this.index];
    if (++this.index >= this.tokens.length) {
      this.index = 0;
    }

    return currentToken;
  }
}
