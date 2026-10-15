class TagManager {
  constructor() {
    this.tagToKeys = new Map(); // tag -> Set<key>
    this.keyToTags = new Map(); // key -> Set<tag>
  }

  addKeyWithTags(key, tags = []) {
    if (!tags || !tags.length) return;

    if (!this.keyToTags.has(key)) {
      this.keyToTags.set(key, new Set());
    }
    const keyTags = this.keyToTags.get(key);

    for (const tag of tags) {
      if (!tag) continue;
      keyTags.add(tag);

      if (!this.tagToKeys.has(tag)) {
        this.tagToKeys.set(tag, new Set());
      }
      this.tagToKeys.get(tag).add(key);
    }
  }

  getKeysForTag(tag) {
    const keys = this.tagToKeys.get(tag);
    return keys ? Array.from(keys) : [];
  }

  removeKey(key) {
    const tags = this.keyToTags.get(key);
    if (!tags) return;

    for (const tag of tags) {
      const keys = this.tagToKeys.get(tag);
      if (keys) {
        keys.delete(key);
        if (keys.size === 0) {
          this.tagToKeys.delete(tag);
        }
      }
    }
    this.keyToTags.delete(key);
  }

  clearTag(tag) {
    const keys = this.tagToKeys.get(tag);
    if (!keys) return [];

    const keysArray = Array.from(keys);
    for (const key of keysArray) {
      const keyTags = this.keyToTags.get(key);
      if (keyTags) {
        keyTags.delete(tag);
        if (keyTags.size === 0) {
          this.keyToTags.delete(key);
        }
      }
    }
    this.tagToKeys.delete(tag);
    return keysArray;
  }
}

export const tagManager = new TagManager();
