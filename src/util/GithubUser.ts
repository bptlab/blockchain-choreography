export interface IGithubUser {
  username: string;
  avatar_url: string;
  name: string;
  company: string;
}

export default class User {
  public publicKey: string;
  public github: IGithubUser;

  constructor(publicKey: string, githubUsername: string) {
    this.publicKey = publicKey;
    this.github = {
      username: githubUsername,
      avatar_url: "",
      name: "",
      company: "",
    };
  }

  public async fetchUserInformation(): Promise<User> {
    await this.fetchGithubProfileInformation();
    return this;
  }

  protected async fetchGithubProfileInformation() {
    const url = `https://api.github.com/users/${this.github.username}`;
    const response = await fetch(url);
    const data = await response.json();

    this.github.avatar_url = data.avatar_url;
    this.github.name = data.name;
    this.github.company = data.company;
  }
}
