// Words chosen to be recognizable at 12x12 pixels: concrete objects with a
// strong silhouette. Nothing abstract, nothing that needs fine detail.
export const WORDS = [
  'apple', 'anchor', 'arrow', 'axe', 'balloon', 'banana', 'bat', 'bed',
  'bee', 'bell', 'bicycle', 'bird', 'boat', 'bomb', 'bone', 'book',
  'boot', 'bottle', 'bowl', 'bowtie', 'bridge', 'broom', 'bucket', 'bug',
  'burger', 'bus', 'butterfly', 'cactus', 'cake', 'camera', 'campfire',
  'candle', 'candy', 'car', 'carrot', 'castle', 'cat', 'chair', 'cheese',
  'cherry', 'chicken', 'church', 'clock', 'cloud', 'clover', 'coffee',
  'coin', 'compass', 'cookie', 'corn', 'cow', 'crab', 'crown', 'cup',
  'diamond', 'dice', 'dinosaur', 'dog', 'dolphin', 'donut', 'door',
  'dragon', 'drum', 'duck', 'egg', 'elephant', 'envelope', 'eye', 'fan',
  'feather', 'fence', 'fire', 'fish', 'flag', 'flower', 'football',
  'fork', 'fox', 'frog', 'ghost', 'gift', 'giraffe', 'glasses', 'globe',
  'guitar', 'hammer', 'hand', 'hat', 'heart', 'hedgehog', 'helicopter',
  'house', 'ice cream', 'igloo', 'island', 'jellyfish', 'key', 'kite',
  'knife', 'ladder', 'ladybug', 'lamp', 'leaf', 'lemon', 'lightning',
  'lighthouse', 'lion', 'lips', 'lock', 'lollipop', 'magnet', 'mailbox',
  'map', 'moon', 'mountain', 'mouse', 'mushroom', 'music note', 'nail',
  'necklace', 'octopus', 'onion', 'owl', 'paintbrush', 'palm tree',
  'panda', 'paperclip', 'peach', 'pear', 'pencil', 'penguin', 'phone',
  'piano', 'pig', 'pineapple', 'pizza', 'planet', 'plug', 'popsicle',
  'pumpkin', 'rabbit', 'raccoon', 'rainbow', 'ring', 'robot', 'rocket',
  'rose', 'sailboat', 'sandwich', 'saw', 'scissors', 'shark', 'sheep',
  'shell', 'ship', 'shoe', 'shovel', 'skull', 'snail', 'snake',
  'snowflake', 'snowman', 'sock', 'spider', 'spoon', 'star', 'starfish',
  'strawberry', 'sun', 'sunflower', 'sunglasses', 'sushi', 'sword',
  'table', 'taco', 'teapot', 'teddy bear', 'telescope', 'tent', 'tie',
  'tiger', 'toast', 'tooth', 'tornado', 'tractor', 'train', 'tree',
  'trophy', 'truck', 'trumpet', 'turtle', 'tv', 'umbrella', 'unicorn',
  'volcano', 'watermelon', 'whale', 'wheel', 'windmill', 'window',
  'wizard', 'worm', 'wrench', 'zebra',
]

export function randomWord(exclude = []) {
  const pool = WORDS.filter((w) => !exclude.includes(w))
  const list = pool.length ? pool : WORDS
  return list[Math.floor(Math.random() * list.length)]
}
