export interface IGithubUser {
  username: string;
  avatar_url: string;
  name: string;
  company: string;
}

export default class User {

  public static async build(publicKey: string, githubUsername: string): Promise<User> {
    try {
      const githubUser: IGithubUser = await User.fetchGithubUser(githubUsername);
      return new User(publicKey, githubUser);
    } catch (e) {
      return this.emptyUser();
    }
  }

  public static emptyUser(): User {
    return new User("", {
      username: "",
      avatar_url: "",
      name: "",
      company: "",
    });
  }

  protected static async fetchGithubUser(username: string): Promise<IGithubUser> {
    const url = `https://api.github.com/users/${username}`;
    const response = await fetch(url);
    const data = await response.json();

    const githubUser: IGithubUser = {
      username,
      avatar_url: data.avatar_url,
      name: data.name,
      company: data.company,
    };

    return githubUser;
  }

  public publicKey: string;
  public github: IGithubUser;

  constructor(publicKey: string, githubUser: IGithubUser) {
    if (typeof githubUser === "undefined") {
      throw new Error("Cannot be called directly. Call build or emptyUser instead.");
    }
    this.publicKey = publicKey;
    this.github = githubUser;
  }
}
