import dayjs from "dayjs";

export function shareLink() {}

export function microTimeAgo(date) {
  return dayjs(date).format("ddd");
}

export function abbrNumber(num, fixed) {
  if (isNaN(num)) return num;
  return num;
}

export function formatPost(text: string, options: object = {}) {
  const config = {
    hashtags: {
      pattern: /#(\w+)/g,
      url: "/tags/$1",
    },
    mentions: {
      pattern: /@(\w+)/g,
      url: "/$1",
    },
    bold: {
      pattern: /\*\*(.*?)\*\*/g,
      replace: "<strong>$1</strong>",
    },
    underline: {
      pattern: /__(.*?)__/g,
      replace: "<u>$1</u>",
    },
    ...options,
  };

  let convertedText = text;

  // Convert hashtags to links
  if (config.hashtags && config.hashtags.pattern) {
    const { pattern, url } = config.hashtags;
    convertedText = convertedText.replace(pattern, `<a href="${url}">#$1</a>`);
  }

  // Convert mentions to links
  if (config.mentions && config.mentions.pattern) {
    const { pattern, url } = config.mentions;
    convertedText = convertedText.replace(pattern, `<a href="${url}">@$1</a>`);
  }

  // Apply other Markdown styles
  if (config.bold && config.bold.pattern) {
    const { pattern, replace } = config.bold;
    convertedText = convertedText.replace(pattern, replace);
  }

  if (config.underline && config.underline.pattern) {
    const { pattern, replace } = config.underline;
    convertedText = convertedText.replace(pattern, replace);
  }

  return convertedText;
}
