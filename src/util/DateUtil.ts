export default class DateUtil {

  public static dateToTimeAgo(date: Date): string {
    const currentDate = new Date();
    const secondsAgo = ((currentDate as any) - (date as any)) / 1000;

    if (secondsAgo < 60) {
      return "just now";
    } else if (secondsAgo < 3600) {
      return `${Math.floor(secondsAgo / 60)} minutes ago`;
    } else if (secondsAgo < 86400) {
      return `${Math.floor(secondsAgo / 3600)} hours ago`;
    } else {
      return `${Math.floor(secondsAgo / 86400)} days ago`;
    }
  }

  public static getDay(date: Date): string {
    const options = {
      day: "2-digit",
    };
    return date.toLocaleDateString(undefined, options);
  }

  public static getMonth(date: Date): string {
    const options = {
      month: "long",
    };
    return date.toLocaleDateString(undefined, options);
  }

  public static getYear(date: Date): string {
    const options = {
      year: "numeric",
    };
    return date.toLocaleDateString(undefined, options);
  }
}
