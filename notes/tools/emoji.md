# Emoji Picker

Click an emoji to copy it to your clipboard. Use the search to filter by name.

<div id="emoji-root">
  <div class="emoji-header">
    <span class="emoji-title">⬢ Emoji Picker</span>
  </div>

  <div class="emoji-search-row">
    <span class="emoji-search-icon">🔍</span>
    <input id="emoji-search" type="text" placeholder="Search emoji…" />
    <button class="emoji-btn" id="clear-search-btn" title="Clear">✕</button>
  </div>

  <div id="emoji-toast" style="display:none"></div>

  <div id="emoji-grid"></div>

  <div id="emoji-recent" style="display:none">
    <div class="emoji-recent-header">
      <span>Recently used</span>
      <button class="emoji-btn emoji-btn-small" id="clear-recent-btn">Clear</button>
    </div>
    <div id="emoji-recent-grid"></div>
  </div>
</div>

<script>
(function() {
  const CATEGORIES = [
    {
      name: 'Smileys & People',
      emojis: [
        { char: '😀', name: 'grinning face' },
        { char: '😃', name: 'grinning face with big eyes' },
        { char: '😄', name: 'grinning face with smiling eyes' },
        { char: '😁', name: 'beaming face with smiling eyes' },
        { char: '😆', name: 'grinning squinting face' },
        { char: '😅', name: 'grinning face with sweat' },
        { char: '🤣', name: 'rolling on the floor laughing' },
        { char: '😂', name: 'face with tears of joy' },
        { char: '🙂', name: 'slightly smiling face' },
        { char: '😊', name: 'smiling face with smiling eyes' },
        { char: '😇', name: 'smiling face with halo' },
        { char: '🥰', name: 'smiling face with hearts' },
        { char: '😍', name: 'smiling face with heart-eyes' },
        { char: '🤩', name: 'star-struck' },
        { char: '😘', name: 'face blowing a kiss' },
        { char: '😗', name: 'kissing face' },
        { char: '😚', name: 'kissing face with closed eyes' },
        { char: '😙', name: 'kissing face with smiling eyes' },
        { char: '🥲', name: 'smiling face with tear' },
        { char: '😋', name: 'face savoring food' },
        { char: '😛', name: 'face with tongue' },
        { char: '😜', name: 'winking face with tongue' },
        { char: '🤪', name: 'zany face' },
        { char: '😝', name: 'squinting face with tongue' },
        { char: '🤑', name: 'money-mouth face' },
        { char: '🤗', name: 'hugging face' },
        { char: '🤭', name: 'face with hand over mouth' },
        { char: '🫢', name: 'face with open eyes and hand over mouth' },
        { char: '🫣', name: 'face with peeking eye' },
        { char: '🤫', name: 'shushing face' },
        { char: '🤔', name: 'thinking face' },
        { char: '🫡', name: 'saluting face' },
        { char: '🤐', name: 'zipper-mouth face' },
        { char: '🤨', name: 'face with raised eyebrow' },
        { char: '😐', name: 'neutral face' },
        { char: '😑', name: 'expressionless face' },
        { char: '😶', name: 'face without mouth' },
        { char: '😏', name: 'smirking face' },
        { char: '😒', name: 'unamused face' },
        { char: '🙄', name: 'face with rolling eyes' },
        { char: '😬', name: 'grimacing face' },
        { char: '😮‍💨', name: 'face exhaling' },
        { char: '🤥', name: 'lying face' },
        { char: '😌', name: 'relieved face' },
        { char: '😔', name: 'pensive face' },
        { char: '😪', name: 'sleepy face' },
        { char: '🤤', name: 'drooling face' },
        { char: '😴', name: 'sleeping face' },
        { char: '😷', name: 'face with medical mask' },
        { char: '🤒', name: 'face with thermometer' },
        { char: '🤕', name: 'face with head-bandage' },
        { char: '🤢', name: 'nauseated face' },
        { char: '🤮', name: 'face vomiting' },
        { char: '🤧', name: 'sneezing face' },
        { char: '🥵', name: 'hot face' },
        { char: '🥶', name: 'cold face' },
        { char: '🥴', name: 'woozy face' },
        { char: '😵', name: 'face with crossed-out eyes' },
        { char: '🤯', name: 'exploding head' },
        { char: '🤠', name: 'cowboy hat face' },
        { char: '🥳', name: 'partying face' },
        { char: '🥸', name: 'disguised face' },
        { char: '😎', name: 'smiling face with sunglasses' },
        { char: '🤓', name: 'nerd face' },
        { char: '🧐', name: 'face with monocle' },
        { char: '😕', name: 'confused face' },
        { char: '🫤', name: 'face with diagonal mouth' },
        { char: '😟', name: 'worried face' },
        { char: '🙁', name: 'slightly frowning face' },
        { char: '😮', name: 'face with open mouth' },
        { char: '😯', name: 'hushed face' },
        { char: '😲', name: 'astonished face' },
        { char: '😳', name: 'flushed face' },
        { char: '🥺', name: 'pleading face' },
        { char: '😦', name: 'frowning face with open mouth' },
        { char: '😧', name: 'anguished face' },
        { char: '😨', name: 'fearful face' },
        { char: '😰', name: 'anxious face with sweat' },
        { char: '😥', name: 'sad but relieved face' },
        { char: '😢', name: 'crying face' },
        { char: '😭', name: 'loudly crying face' },
        { char: '😱', name: 'face screaming in fear' },
        { char: '😖', name: 'confounded face' },
        { char: '😣', name: 'persevering face' },
        { char: '😞', name: 'disappointed face' },
        { char: '😓', name: 'downcast face with sweat' },
        { char: '😩', name: 'weary face' },
        { char: '😫', name: 'tired face' },
        { char: '🥱', name: 'yawning face' },
        { char: '😤', name: 'face with steam from nose' },
        { char: '😡', name: 'enraged face' },
        { char: '😠', name: 'angry face' },
        { char: '🤬', name: 'face with symbols on mouth' },
        { char: '😈', name: 'smiling face with horns' },
        { char: '👿', name: 'angry face with horns' },
        { char: '💀', name: 'skull' },
        { char: '☠️', name: 'skull and crossbones' },
        { char: '💩', name: 'pile of poo' },
        { char: '🤡', name: 'clown face' },
        { char: '👹', name: 'ogre' },
        { char: '👺', name: 'goblin' },
        { char: '👻', name: 'ghost' },
        { char: '👽', name: 'alien' },
        { char: '👾', name: 'alien monster' },
        { char: '🤖', name: 'robot' },
        { char: '😺', name: 'grinning cat' },
        { char: '😸', name: 'grinning cat with smiling eyes' },
        { char: '😹', name: 'cat with tears of joy' },
        { char: '😻', name: 'smiling cat with heart-eyes' },
        { char: '😼', name: 'cat with wry smile' },
        { char: '😽', name: 'kissing cat' },
        { char: '🙀', name: 'weary cat' },
        { char: '😿', name: 'crying cat' },
        { char: '😾', name: 'pouting cat' },
        { char: '🙈', name: 'see-no-evil monkey' },
        { char: '🙉', name: 'hear-no-evil monkey' },
        { char: '🙊', name: 'speak-no-evil monkey' },
        { char: '💋', name: 'kiss mark' },
        { char: '💌', name: 'love letter' },
        { char: '💘', name: 'heart with arrow' },
        { char: '💝', name: 'heart with ribbon' },
        { char: '💖', name: 'sparkling heart' },
        { char: '💗', name: 'growing heart' },
        { char: '💓', name: 'beating heart' },
        { char: '💞', name: 'revolving hearts' },
        { char: '💕', name: 'two hearts' },
        { char: '💟', name: 'heart decoration' },
        { char: '❣️', name: 'heart exclamation' },
        { char: '💔', name: 'broken heart' },
        { char: '❤️‍🔥', name: 'heart on fire' },
        { char: '❤️‍🩹', name: 'mending heart' },
        { char: '❤️', name: 'red heart' },
        { char: '🩷', name: 'pink heart' },
        { char: '🧡', name: 'orange heart' },
        { char: '💛', name: 'yellow heart' },
        { char: '💚', name: 'green heart' },
        { char: '💙', name: 'blue heart' },
        { char: '🩵', name: 'light blue heart' },
        { char: '💜', name: 'purple heart' },
        { char: '🖤', name: 'black heart' },
        { char: '🩶', name: 'grey heart' },
        { char: '🤍', name: 'white heart' },
        { char: '🤎', name: 'brown heart' },
        { char: '💯', name: 'hundred points' },
        { char: '💢', name: 'anger symbol' },
        { char: '💥', name: 'collision' },
        { char: '💫', name: 'dizzy' },
        { char: '💦', name: 'sweat droplets' },
        { char: '💨', name: 'dashing away' },
        { char: '🕳️', name: 'hole' },
        { char: '💬', name: 'speech balloon' },
        { char: '👁️‍🗨️', name: 'eye in speech bubble' },
        { char: '🗨️', name: 'left speech bubble' },
        { char: '🗯️', name: 'right anger bubble' },
        { char: '💭', name: 'thought balloon' },
        { char: '💤', name: 'zzz' },
        { char: '👋', name: 'waving hand' },
        { char: '🤚', name: 'raised back of hand' },
        { char: '🖐️', name: 'hand with fingers splayed' },
        { char: '✋', name: 'raised hand' },
        { char: '🖖', name: 'vulcan salute' },
        { char: '🫱', name: 'rightwards hand' },
        { char: '🫲', name: 'leftwards hand' },
        { char: '🫳', name: 'palm down hand' },
        { char: '🫴', name: 'palm up hand' },
        { char: '👌', name: 'ok hand' },
        { char: '🤌', name: 'pinched fingers' },
        { char: '🤏', name: 'pinching hand' },
        { char: '✌️', name: 'victory hand' },
        { char: '🤞', name: 'crossed fingers' },
        { char: '🫰', name: 'hand with index finger and thumb crossed' },
        { char: '🤟', name: 'love-you gesture' },
        { char: '🤘', name: 'sign of the horns' },
        { char: '🤙', name: 'call me hand' },
        { char: '👈', name: 'backhand index pointing left' },
        { char: '👉', name: 'backhand index pointing right' },
        { char: '👆', name: 'backhand index pointing up' },
        { char: '🖕', name: 'middle finger' },
        { char: '👇', name: 'backhand index pointing down' },
        { char: '☝️', name: 'index pointing up' },
        { char: '🫵', name: 'index pointing at the viewer' },
        { char: '👍', name: 'thumbs up' },
        { char: '👎', name: 'thumbs down' },
        { char: '✊', name: 'raised fist' },
        { char: '👊', name: 'oncoming fist' },
        { char: '🤛', name: 'left-facing fist' },
        { char: '🤜', name: 'right-facing fist' },
        { char: '👏', name: 'clapping hands' },
        { char: '🙌', name: 'raising hands' },
        { char: '🫶', name: 'heart hands' },
        { char: '👐', name: 'open hands' },
        { char: '🤲', name: 'palms up together' },
        { char: '🤝', name: 'handshake' },
        { char: '🙏', name: 'folded hands' },
        { char: '✍️', name: 'writing hand' },
        { char: '💅', name: 'nail polish' },
        { char: '🤳', name: 'selfie' },
        { char: '💪', name: 'flexed biceps' },
        { char: '🦾', name: 'mechanical arm' },
        { char: '🦿', name: 'mechanical leg' },
        { char: '🦵', name: 'leg' },
        { char: '🦶', name: 'foot' },
        { char: '👂', name: 'ear' },
        { char: '🦻', name: 'ear with hearing aid' },
        { char: '👃', name: 'nose' },
        { char: '🧠', name: 'brain' },
        { char: '🫀', name: 'anatomical heart' },
        { char: '🫁', name: 'lungs' },
        { char: '🦷', name: 'tooth' },
        { char: '🦴', name: 'bone' },
        { char: '👀', name: 'eyes' },
        { char: '👁️', name: 'eye' },
        { char: '👅', name: 'tongue' },
        { char: '👄', name: 'mouth' },
        { char: '🫦', name: 'biting lip' },
        { char: '👶', name: 'baby' },
        { char: '🧒', name: 'child' },
        { char: '👦', name: 'boy' },
        { char: '👧', name: 'girl' },
        { char: '🧑', name: 'person' },
        { char: '👨', name: 'man' },
        { char: '👩', name: 'woman' },
        { char: '🧔', name: 'bearded person' },
        { char: '👴', name: 'old man' },
        { char: '👵', name: 'old woman' },
      ],
    },
    {
      name: 'Animals & Nature',
      emojis: [
        { char: '🐶', name: 'dog face' },
        { char: '🐱', name: 'cat face' },
        { char: '🐭', name: 'mouse face' },
        { char: '🐹', name: 'hamster' },
        { char: '🐰', name: 'rabbit face' },
        { char: '🦊', name: 'fox' },
        { char: '🐻', name: 'bear' },
        { char: '🐼', name: 'panda' },
        { char: '🐻‍❄️', name: 'polar bear' },
        { char: '🐨', name: 'koala' },
        { char: '🐯', name: 'tiger face' },
        { char: '🦁', name: 'lion' },
        { char: '🐮', name: 'cow face' },
        { char: '🐷', name: 'pig face' },
        { char: '🐸', name: 'frog' },
        { char: '🐵', name: 'monkey face' },
        { char: '🐔', name: 'chicken' },
        { char: '🐧', name: 'penguin' },
        { char: '🐦', name: 'bird' },
        { char: '🐤', name: 'baby chick' },
        { char: '🦆', name: 'duck' },
        { char: '🦅', name: 'eagle' },
        { char: '🦉', name: 'owl' },
        { char: '🦇', name: 'bat' },
        { char: '🐺', name: 'wolf' },
        { char: '🐗', name: 'boar' },
        { char: '🐴', name: 'horse face' },
        { char: '🦄', name: 'unicorn' },
        { char: '🐝', name: 'honeybee' },
        { char: '🪱', name: 'worm' },
        { char: '🐛', name: 'bug' },
        { char: '🦋', name: 'butterfly' },
        { char: '🐌', name: 'snail' },
        { char: '🐞', name: 'lady beetle' },
        { char: '🐜', name: 'ant' },
        { char: '🦟', name: 'mosquito' },
        { char: '🦗', name: 'cricket' },
        { char: '🪳', name: 'cockroach' },
        { char: '🦂', name: 'scorpion' },
        { char: '🐢', name: 'turtle' },
        { char: '🐍', name: 'snake' },
        { char: '🦎', name: 'lizard' },
        { char: '🦖', name: 't-rex' },
        { char: '🦕', name: 'sauropod' },
        { char: '🐙', name: 'octopus' },
        { char: '🦑', name: 'squid' },
        { char: '🪼', name: 'jellyfish' },
        { char: '🦐', name: 'shrimp' },
        { char: '🐠', name: 'tropical fish' },
        { char: '🐟', name: 'fish' },
        { char: '🐡', name: 'blowfish' },
        { char: '🐬', name: 'dolphin' },
        { char: '🐳', name: 'spouting whale' },
        { char: '🐋', name: 'whale' },
        { char: '🦈', name: 'shark' },
        { char: '🐊', name: 'crocodile' },
        { char: '🐅', name: 'tiger' },
        { char: '🐆', name: 'leopard' },
        { char: '🦓', name: 'zebra' },
        { char: '🦍', name: 'gorilla' },
        { char: '🦧', name: 'orangutan' },
        { char: '🐘', name: 'elephant' },
        { char: '🦛', name: 'hippopotamus' },
        { char: '🦏', name: 'rhinoceros' },
        { char: '🐪', name: 'camel' },
        { char: '🐫', name: 'two-hump camel' },
        { char: '🦒', name: 'giraffe' },
        { char: '🦘', name: 'kangaroo' },
        { char: '🦬', name: 'bison' },
        { char: '🐃', name: 'water buffalo' },
        { char: '🐂', name: 'ox' },
        { char: '🐄', name: 'cow' },
        { char: '🐎', name: 'horse' },
        { char: '🐖', name: 'pig' },
        { char: '🐏', name: 'ram' },
        { char: '🐑', name: 'ewe' },
        { char: '🦙', name: 'llama' },
        { char: '🐐', name: 'goat' },
        { char: '🦌', name: 'deer' },
        { char: '🐕', name: 'dog' },
        { char: '🐩', name: 'poodle' },
        { char: '🦮', name: 'guide dog' },
        { char: '🐕‍🦺', name: 'service dog' },
        { char: '🐈', name: 'cat' },
        { char: '🐈‍⬛', name: 'black cat' },
        { char: '🪶', name: 'feather' },
        { char: '🐓', name: 'rooster' },
        { char: '🦃', name: 'turkey' },
        { char: '🦤', name: 'dodo' },
        { char: '🐇', name: 'rabbit' },
        { char: '🐁', name: 'mouse' },
        { char: '🐀', name: 'rat' },
        { char: '🐿️', name: 'chipmunk' },
        { char: '🦔', name: 'hedgehog' },
        { char: '🐾', name: 'paw prints' },
        { char: '🐉', name: 'dragon' },
        { char: '🐲', name: 'dragon face' },
        { char: '🌵', name: 'cactus' },
        { char: '🎄', name: 'christmas tree' },
        { char: '🌲', name: 'evergreen tree' },
        { char: '🌳', name: 'deciduous tree' },
        { char: '🌴', name: 'palm tree' },
        { char: '🪵', name: 'wood' },
        { char: '🌱', name: 'seedling' },
        { char: '🌿', name: 'herb' },
        { char: '☘️', name: 'shamrock' },
        { char: '🍀', name: 'four leaf clover' },
        { char: '🎍', name: 'pine decoration' },
        { char: '🪴', name: 'potted plant' },
        { char: '🎋', name: 'tanabata tree' },
        { char: '🍃', name: 'leaves' },
        { char: '🍂', name: 'fallen leaf' },
        { char: '🍁', name: 'maple leaf' },
        { char: '🪿', name: 'goose' },
        { char: '🌾', name: 'sheaf of rice' },
        { char: '🌺', name: 'hibiscus' },
        { char: '🌻', name: 'sunflower' },
        { char: '🌹', name: 'rose' },
        { char: '🥀', name: 'wilted flower' },
        { char: '🌷', name: 'tulip' },
        { char: '🌼', name: 'blossom' },
        { char: '🌸', name: 'cherry blossom' },
        { char: '💐', name: 'bouquet' },
        { char: '🍄', name: 'mushroom' },
        { char: '🌰', name: 'chestnut' },
        { char: '🪨', name: 'rock' },
      ],
    },
    {
      name: 'Food & Drink',
      emojis: [
        { char: '🍇', name: 'grapes' },
        { char: '🍈', name: 'melon' },
        { char: '🍉', name: 'watermelon' },
        { char: '🍊', name: 'tangerine' },
        { char: '🍋', name: 'lemon' },
        { char: '🍌', name: 'banana' },
        { char: '🍍', name: 'pineapple' },
        { char: '🥭', name: 'mango' },
        { char: '🍎', name: 'red apple' },
        { char: '🍏', name: 'green apple' },
        { char: '🍐', name: 'pear' },
        { char: '🍑', name: 'peach' },
        { char: '🍒', name: 'cherries' },
        { char: '🍓', name: 'strawberry' },
        { char: '🫐', name: 'blueberries' },
        { char: '🥝', name: 'kiwi' },
        { char: '🍅', name: 'tomato' },
        { char: '🫒', name: 'olive' },
        { char: '🥥', name: 'coconut' },
        { char: '🥑', name: 'avocado' },
        { char: '🍆', name: 'eggplant' },
        { char: '🥔', name: 'potato' },
        { char: '🥕', name: 'carrot' },
        { char: '🌽', name: 'corn' },
        { char: '🌶️', name: 'hot pepper' },
        { char: '🫑', name: 'bell pepper' },
        { char: '🥒', name: 'cucumber' },
        { char: '🥬', name: 'leafy green' },
        { char: '🥦', name: 'broccoli' },
        { char: '🧄', name: 'garlic' },
        { char: '🧅', name: 'onion' },
        { char: '🥜', name: 'peanuts' },
        { char: '🫘', name: 'beans' },
        { char: '🌰', name: 'chestnut' },
        { char: '🍞', name: 'bread' },
        { char: '🥐', name: 'croissant' },
        { char: '🥖', name: 'baguette bread' },
        { char: '🫓', name: 'flatbread' },
        { char: '🥨', name: 'pretzel' },
        { char: '🥯', name: 'bagel' },
        { char: '🥞', name: 'pancakes' },
        { char: '🧇', name: 'waffle' },
        { char: '🧀', name: 'cheese wedge' },
        { char: '🍖', name: 'meat on bone' },
        { char: '🍗', name: 'poultry leg' },
        { char: '🥩', name: 'cut of meat' },
        { char: '🥓', name: 'bacon' },
        { char: '🍔', name: 'hamburger' },
        { char: '🍟', name: 'french fries' },
        { char: '🍕', name: 'pizza' },
        { char: '🌭', name: 'hot dog' },
        { char: '🥪', name: 'sandwich' },
        { char: '🌮', name: 'taco' },
        { char: '🌯', name: 'burrito' },
        { char: '🫔', name: 'tamale' },
        { char: '🥙', name: 'stuffed flatbread' },
        { char: '🧆', name: 'falafel' },
        { char: '🥚', name: 'egg' },
        { char: '🍳', name: 'cooking' },
        { char: '🥘', name: 'shallow pan of food' },
        { char: '🍲', name: 'pot of food' },
        { char: '🫕', name: 'fondue' },
        { char: '🥣', name: 'bowl with spoon' },
        { char: '🥗', name: 'green salad' },
        { char: '🍿', name: 'popcorn' },
        { char: '🧈', name: 'butter' },
        { char: '🧂', name: 'salt' },
        { char: '🥫', name: 'canned food' },
        { char: '🍱', name: 'bento box' },
        { char: '🍘', name: 'rice cracker' },
        { char: '🍙', name: 'rice ball' },
        { char: '🍚', name: 'cooked rice' },
        { char: '🍛', name: 'curry rice' },
        { char: '🍜', name: 'steaming bowl' },
        { char: '🍝', name: 'spaghetti' },
        { char: '🍠', name: 'roasted sweet potato' },
        { char: '🍢', name: 'oden' },
        { char: '🍣', name: 'sushi' },
        { char: '🍤', name: 'fried shrimp' },
        { char: '🍥', name: 'fish cake' },
        { char: '🥮', name: 'moon cake' },
        { char: '🍡', name: 'dango' },
        { char: '🥟', name: 'dumpling' },
        { char: '🦪', name: 'oyster' },
        { char: '🥠', name: 'fortune cookie' },
        { char: '🥡', name: 'takeout box' },
        { char: '🍦', name: 'soft ice cream' },
        { char: '🍧', name: 'shaved ice' },
        { char: '🍨', name: 'ice cream' },
        { char: '🍩', name: 'doughnut' },
        { char: '🍪', name: 'cookie' },
        { char: '🎂', name: 'birthday cake' },
        { char: '🍰', name: 'shortcake' },
        { char: '🧁', name: 'cupcake' },
        { char: '🥧', name: 'pie' },
        { char: '🍫', name: 'chocolate bar' },
        { char: '🍬', name: 'candy' },
        { char: '🍭', name: 'lollipop' },
        { char: '🍮', name: 'custard' },
        { char: '🍯', name: 'honey pot' },
        { char: '🍼', name: 'baby bottle' },
        { char: '🥛', name: 'glass of milk' },
        { char: '☕', name: 'hot beverage' },
        { char: '🫖', name: 'teapot' },
        { char: '🍵', name: 'teacup without handle' },
        { char: '🧃', name: 'beverage box' },
        { char: '🥤', name: 'cup with straw' },
        { char: '🧋', name: 'bubble tea' },
        { char: '🍶', name: 'sake' },
        { char: '🍺', name: 'beer mug' },
        { char: '🍻', name: 'clinking beer mugs' },
        { char: '🥂', name: 'clinking glasses' },
        { char: '🍷', name: 'wine glass' },
        { char: '🫗', name: 'pouring liquid' },
        { char: '🥃', name: 'tumbler glass' },
        { char: '🍸', name: 'cocktail glass' },
        { char: '🍹', name: 'tropical drink' },
        { char: '🧊', name: 'ice cube' },
        { char: '🥄', name: 'spoon' },
        { char: '🔪', name: 'kitchen knife' },
        { char: '🫙', name: 'jar' },
        { char: '🏺', name: 'amphora' },
      ],
    },
    {
      name: 'Activities & Travel',
      emojis: [
        { char: '⚽', name: 'soccer ball' },
        { char: '🏀', name: 'basketball' },
        { char: '🏈', name: 'american football' },
        { char: '⚾', name: 'baseball' },
        { char: '🥎', name: 'softball' },
        { char: '🏐', name: 'volleyball' },
        { char: '🏉', name: 'rugby football' },
        { char: '🎾', name: 'tennis' },
        { char: '🥏', name: 'flying disc' },
        { char: '🎳', name: 'bowling' },
        { char: '🏏', name: 'cricket game' },
        { char: '🏑', name: 'field hockey' },
        { char: '🏒', name: 'ice hockey' },
        { char: '🥍', name: 'lacrosse' },
        { char: '🏓', name: 'ping pong' },
        { char: '🏸', name: 'badminton' },
        { char: '🥊', name: 'boxing glove' },
        { char: '🥋', name: 'martial arts uniform' },
        { char: '🥅', name: 'goal net' },
        { char: '⛳', name: 'flag in hole' },
        { char: '⛸️', name: 'ice skate' },
        { char: '🎣', name: 'fishing pole' },
        { char: '🤿', name: 'diving mask' },
        { char: '🎽', name: 'running shirt' },
        { char: '🎿', name: 'skis' },
        { char: '🛷', name: 'sled' },
        { char: '🥌', name: 'curling stone' },
        { char: '🎯', name: 'bullseye' },
        { char: '🪀', name: 'yo-yo' },
        { char: '🪁', name: 'kite' },
        { char: '🎱', name: 'pool 8 ball' },
        { char: '🔮', name: 'crystal ball' },
        { char: '🪄', name: 'magic wand' },
        { char: '🎮', name: 'video game' },
        { char: '🕹️', name: 'joystick' },
        { char: '🎰', name: 'slot machine' },
        { char: '🎲', name: 'game die' },
        { char: '🧩', name: 'puzzle piece' },
        { char: '🧸', name: 'teddy bear' },
        { char: '🪅', name: 'pinata' },
        { char: '🪩', name: 'mirror ball' },
        { char: '🎨', name: 'artist palette' },
        { char: '🎭', name: 'performing arts' },
        { char: '🎤', name: 'microphone' },
        { char: '🎧', name: 'headphone' },
        { char: '🎵', name: 'musical note' },
        { char: '🎶', name: 'musical notes' },
        { char: '🎼', name: 'musical score' },
        { char: '🎹', name: 'musical keyboard' },
        { char: '🥁', name: 'drum' },
        { char: '🪘', name: 'long drum' },
        { char: '🎷', name: 'saxophone' },
        { char: '🎺', name: 'trumpet' },
        { char: '🎸', name: 'guitar' },
        { char: '🪕', name: 'banjo' },
        { char: '🎻', name: 'violin' },
        { char: '🪗', name: 'accordion' },
        { char: '🎙️', name: 'studio microphone' },
        { char: '🎬', name: 'clapper board' },
        { char: '📚', name: 'books' },
        { char: '📖', name: 'open book' },
        { char: '📕', name: 'closed book' },
        { char: '📗', name: 'green book' },
        { char: '📘', name: 'blue book' },
        { char: '📙', name: 'orange book' },
        { char: '📔', name: 'notebook with decorative cover' },
        { char: '📓', name: 'notebook' },
        { char: '✏️', name: 'pencil' },
        { char: '🖊️', name: 'pen' },
        { char: '🖋️', name: 'fountain pen' },
        { char: '✒️', name: 'black nib' },
        { char: '🖌️', name: 'paintbrush' },
        { char: '🖍️', name: 'crayon' },
        { char: '📝', name: 'memo' },
        { char: '📋', name: 'clipboard' },
        { char: '🗂️', name: 'card index dividers' },
        { char: '📁', name: 'file folder' },
        { char: '📂', name: 'open file folder' },
        { char: '🖥️', name: 'desktop computer' },
        { char: '💻', name: 'laptop' },
        { char: '🖨️', name: 'printer' },
        { char: '⌨️', name: 'keyboard' },
        { char: '🖱️', name: 'computer mouse' },
        { char: '🖲️', name: 'trackball' },
        { char: '💽', name: 'computer disk' },
        { char: '💾', name: 'floppy disk' },
        { char: '💿', name: 'optical disk' },
        { char: '📀', name: 'dvd' },
        { char: '📷', name: 'camera' },
        { char: '📸', name: 'camera with flash' },
        { char: '📹', name: 'video camera' },
        { char: '🎥', name: 'movie camera' },
        { char: '📽️', name: 'film projector' },
        { char: '📞', name: 'telephone receiver' },
        { char: '☎️', name: 'telephone' },
        { char: '📟', name: 'pager' },
        { char: '📠', name: 'fax machine' },
        { char: '📺', name: 'television' },
        { char: '📻', name: 'radio' },
        { char: '🎙️', name: 'studio microphone' },
        { char: '🎚️', name: 'level slider' },
        { char: '🎛️', name: 'control knobs' },
        { char: '🧭', name: 'compass' },
        { char: '🕰️', name: 'mantelpiece clock' },
        { char: '⌚', name: 'watch' },
        { char: '📱', name: 'mobile phone' },
        { char: '📲', name: 'mobile phone with arrow' },
        { char: '🎒', name: 'backpack' },
        { char: '👟', name: 'running shoe' },
        { char: '👠', name: 'high-heeled shoe' },
        { char: '👗', name: 'dress' },
        { char: '👕', name: 't-shirt' },
        { char: '👔', name: 'necktie' },
        { char: '🧥', name: 'coat' },
        { char: '👚', name: 'woman\'s clothes' },
        { char: '🧢', name: 'billed cap' },
        { char: '🎩', name: 'top hat' },
        { char: '👑', name: 'crown' },
        { char: '💍', name: 'ring' },
        { char: '🌍', name: 'globe showing europe-africa' },
        { char: '🌎', name: 'globe showing americas' },
        { char: '🌏', name: 'globe showing asia-australia' },
        { char: '🗺️', name: 'world map' },
        { char: '🧳', name: 'luggage' },
        { char: '⌚', name: 'watch' },
        { char: '🌡️', name: 'thermometer' },
        { char: '☀️', name: 'sun' },
        { char: '🌞', name: 'sun with face' },
        { char: '⭐', name: 'star' },
        { char: '🌟', name: 'glowing star' },
        { char: '🌙', name: 'crescent moon' },
        { char: '☁️', name: 'cloud' },
        { char: '⛅', name: 'sun behind cloud' },
        { char: '🌈', name: 'rainbow' },
        { char: '⚡', name: 'high voltage' },
        { char: '❄️', name: 'snowflake' },
        { char: '🔥', name: 'fire' },
        { char: '💧', name: 'droplet' },
        { char: '🌊', name: 'water wave' },
        { char: '🎈', name: 'balloon' },
        { char: '🎉', name: 'party popper' },
        { char: '🎊', name: 'confetti ball' },
        { char: '🎀', name: 'ribbon' },
        { char: '🎁', name: 'wrapped gift' },
        { char: '🕯️', name: 'candle' },
        { char: '💡', name: 'light bulb' },
        { char: '🔦', name: 'flashlight' },
        { char: '🏮', name: 'red paper lantern' },
      ],
    },
    {
      name: 'Symbols & Flags',
      emojis: [
        { char: '❤️', name: 'red heart' },
        { char: '🧡', name: 'orange heart' },
        { char: '💛', name: 'yellow heart' },
        { char: '💚', name: 'green heart' },
        { char: '💙', name: 'blue heart' },
        { char: '💜', name: 'purple heart' },
        { char: '🖤', name: 'black heart' },
        { char: '🤍', name: 'white heart' },
        { char: '💔', name: 'broken heart' },
        { char: '💕', name: 'two hearts' },
        { char: '💞', name: 'revolving hearts' },
        { char: '💗', name: 'growing heart' },
        { char: '💖', name: 'sparkling heart' },
        { char: '💝', name: 'heart with ribbon' },
        { char: '💘', name: 'heart with arrow' },
        { char: '💌', name: 'love letter' },
        { char: '✅', name: 'check mark button' },
        { char: '❌', name: 'cross mark' },
        { char: '❓', name: 'question mark' },
        { char: '❕', name: 'white exclamation mark' },
        { char: '❗', name: 'exclamation mark' },
        { char: '➕', name: 'plus' },
        { char: '➖', name: 'minus' },
        { char: '➗', name: 'divide' },
        { char: '♾️', name: 'infinity' },
        { char: '💲', name: 'heavy dollar sign' },
        { char: '💱', name: 'currency exchange' },
        { char: '™️', name: 'trade mark' },
        { char: '©️', name: 'copyright' },
        { char: '®️', name: 'registered' },
        { char: '🔴', name: 'red circle' },
        { char: '🟠', name: 'orange circle' },
        { char: '🟡', name: 'yellow circle' },
        { char: '🟢', name: 'green circle' },
        { char: '🔵', name: 'blue circle' },
        { char: '🟣', name: 'purple circle' },
        { char: '⚫', name: 'black circle' },
        { char: '⚪', name: 'white circle' },
        { char: '🟤', name: 'brown circle' },
        { char: '🔶', name: 'large orange diamond' },
        { char: '🔷', name: 'large blue diamond' },
        { char: '🔸', name: 'small orange diamond' },
        { char: '🔹', name: 'small blue diamond' },
        { char: '🔺', name: 'red triangle pointed up' },
        { char: '🔻', name: 'red triangle pointed down' },
        { char: '💠', name: 'diamond with a dot' },
        { char: '🔘', name: 'radio button' },
        { char: '🔳', name: 'white square button' },
        { char: '🔲', name: 'black square button' },
        { char: '🟥', name: 'red square' },
        { char: '🟧', name: 'orange square' },
        { char: '🟨', name: 'yellow square' },
        { char: '🟩', name: 'green square' },
        { char: '🟦', name: 'blue square' },
        { char: '🟪', name: 'purple square' },
        { char: '⬛', name: 'black large square' },
        { char: '⬜', name: 'white large square' },
        { char: '🟫', name: 'brown square' },
        { char: '🔁', name: 'repeat button' },
        { char: '🔂', name: 'repeat single button' },
        { char: '▶️', name: 'play button' },
        { char: '⏩', name: 'fast-forward' },
        { char: '⏭️', name: 'next track' },
        { char: '⏯️', name: 'play or pause' },
        { char: '◀️', name: 'reverse button' },
        { char: '⏪', name: 'fast reverse' },
        { char: '⏮️', name: 'last track' },
        { char: '🔼', name: 'upwards button' },
        { char: '⏫', name: 'fast up button' },
        { char: '🔽', name: 'downwards button' },
        { char: '⏬', name: 'fast down button' },
        { char: '⏸️', name: 'pause button' },
        { char: '⏹️', name: 'stop button' },
        { char: '⏺️', name: 'record button' },
        { char: '⏏️', name: 'eject button' },
        { char: '🎦', name: 'cinema' },
        { char: '🔅', name: 'dim button' },
        { char: '🔆', name: 'bright button' },
        { char: '📶', name: 'antenna bars' },
        { char: '📳', name: 'vibration mode' },
        { char: '📴', name: 'mobile phone off' },
        { char: '🚩', name: 'triangular flag' },
        { char: '🏁', name: 'chequered flag' },
        { char: '🎌', name: 'crossed flags' },
        { char: '🏴', name: 'black flag' },
        { char: '🏳️', name: 'white flag' },
        { char: '🏳️‍🌈', name: 'rainbow flag' },
        { char: '🏳️‍⚧️', name: 'transgender flag' },
        { char: '🏴‍☠️', name: 'pirate flag' },
        { char: '🇺🇳', name: 'united nations' },
        { char: '🇺🇸', name: 'united states' },
        { char: '🇬🇧', name: 'united kingdom' },
        { char: '🇨🇦', name: 'canada' },
        { char: '🇫🇷', name: 'france' },
        { char: '🇩🇪', name: 'germany' },
        { char: '🇮🇹', name: 'italy' },
        { char: '🇪🇸', name: 'spain' },
        { char: '🇵🇹', name: 'portugal' },
        { char: '🇯🇵', name: 'japan' },
        { char: '🇨🇳', name: 'china' },
        { char: '🇮🇳', name: 'india' },
        { char: '🇧🇷', name: 'brazil' },
        { char: '🇦🇺', name: 'australia' },
        { char: '🇲🇽', name: 'mexico' },
        { char: '🇰🇷', name: 'south korea' },
        { char: '🇳🇱', name: 'netherlands' },
        { char: '🇸🇪', name: 'sweden' },
        { char: '🇳🇴', name: 'norway' },
        { char: '🇩🇰', name: 'denmark' },
        { char: '🇫🇮', name: 'finland' },
        { char: '🇮🇪', name: 'ireland' },
        { char: '🇨🇭', name: 'switzerland' },
        { char: '🇦🇹', name: 'austria' },
        { char: '🇧🇪', name: 'belgium' },
        { char: '🇵🇱', name: 'poland' },
        { char: '🇷🇺', name: 'russia' },
        { char: '🇹🇷', name: 'turkey' },
        { char: '🇮🇱', name: 'israel' },
        { char: '🇦🇪', name: 'uae' },
        { char: '🇸🇦', name: 'saudi arabia' },
        { char: '🇿🇦', name: 'south africa' },
        { char: '🇦🇷', name: 'argentina' },
        { char: '🇨🇱', name: 'chile' },
        { char: '🇨🇴', name: 'colombia' },
        { char: '🇵🇭', name: 'philippines' },
        { char: '🇻🇳', name: 'vietnam' },
        { char: '🇹🇭', name: 'thailand' },
        { char: '🇵🇰', name: 'pakistan' },
        { char: '🇳🇬', name: 'nigeria' },
        { char: '🇰🇪', name: 'kenya' },
        { char: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', name: 'england' },
        { char: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', name: 'scotland' },
        { char: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', name: 'wales' },
      ],
    },
  ];

  // Flatten for searching
  const allEmojis = CATEGORIES.flatMap(c => c.emojis);

  const searchInput = document.getElementById('emoji-search');
  const clearSearchBtn = document.getElementById('clear-search-btn');
  const grid = document.getElementById('emoji-grid');
  const toast = document.getElementById('emoji-toast');
  const recentDiv = document.getElementById('emoji-recent');
  const recentGrid = document.getElementById('emoji-recent-grid');
  const clearRecentBtn = document.getElementById('clear-recent-btn');

  // ─── Recently used ─────────────────────────────────────────────────────

  const STORAGE_KEY = 'emoji_recent';

  function getRecent() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch { return []; }
  }

  function addRecent(char) {
    const recent = getRecent().filter(e => e !== char);
    recent.unshift(char);
    if (recent.length > 30) recent.length = 30;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
    renderRecent();
  }

  function clearRecent() {
    localStorage.removeItem(STORAGE_KEY);
    renderRecent();
  }

  function renderRecent() {
    const recent = getRecent();
    if (recent.length === 0) {
      recentDiv.style.display = 'none';
      return;
    }
    recentDiv.style.display = 'block';
    recentGrid.innerHTML = '';
    for (const char of recent) {
      const btn = document.createElement('button');
      btn.className = 'emoji-cell';
      btn.textContent = char;
      btn.title = char;
      btn.addEventListener('click', () => copyEmoji(char, btn));
      recentGrid.appendChild(btn);
    }
  }

  // ─── Copy to clipboard ────────────────────────────────────────────────

  async function copyEmoji(char, btn) {
    try {
      await navigator.clipboard.writeText(char);
      addRecent(char);
      showToast('Copied ' + char);
      btn.classList.add('copied');
      setTimeout(() => btn.classList.remove('copied'), 400);
    } catch {
      showToast('Failed to copy', true);
    }
  }

  let toastTimer = null;

  function showToast(msg, isError = false) {
    toast.textContent = msg;
    toast.style.display = 'block';
    toast.className = isError ? 'emoji-toast emoji-toast-error' : 'emoji-toast';
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.style.display = 'none'; }, 1500);
  }

  // ─── Render grid ──────────────────────────────────────────────────────

  function renderGrid(filter) {
    grid.innerHTML = '';

    const q = (filter || '').toLowerCase().trim();

    if (!q) {
      // Show all categories
      for (const cat of CATEGORIES) {
        const section = document.createElement('div');
        section.className = 'emoji-section';

        const heading = document.createElement('div');
        heading.className = 'emoji-category';
        heading.textContent = cat.name;
        section.appendChild(heading);

        const catGrid = document.createElement('div');
        catGrid.className = 'emoji-grid';

        for (const emoji of cat.emojis) {
          const btn = document.createElement('button');
          btn.className = 'emoji-cell';
          btn.textContent = emoji.char;
          btn.title = emoji.name;
          btn.addEventListener('click', () => copyEmoji(emoji.char, btn));
          catGrid.appendChild(btn);
        }

        section.appendChild(catGrid);
        grid.appendChild(section);
      }
    } else {
      // Search mode — flat results
      const results = allEmojis.filter(e =>
        e.name.toLowerCase().includes(q) || e.char.includes(q)
      );

      if (results.length === 0) {
        grid.innerHTML = '<div class="emoji-no-results">No emoji found for "' + filter + '"</div>';
        return;
      }

      const catGrid = document.createElement('div');
      catGrid.className = 'emoji-grid';

      for (const emoji of results) {
        const btn = document.createElement('button');
        btn.className = 'emoji-cell';
        btn.textContent = emoji.char;
        btn.title = emoji.name;
        btn.addEventListener('click', () => copyEmoji(emoji.char, btn));
        catGrid.appendChild(btn);
      }

      grid.appendChild(catGrid);
    }
  }

  // ─── Events ───────────────────────────────────────────────────────────

  searchInput.addEventListener('input', () => {
    renderGrid(searchInput.value);
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    renderGrid('');
    searchInput.focus();
  });

  clearRecentBtn.addEventListener('click', clearRecent);

  // ─── Init ─────────────────────────────────────────────────────────────

  renderGrid('');
  renderRecent();
  searchInput.focus();
})();
</script>

<style>
#emoji-root {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 13px;
  border: 1px solid var(--border, #d0d0d0);
  border-radius: 6px;
  overflow: hidden;
  background: var(--bg, #fff);
  color: var(--text, #1a1a1a);
}

/* ─── Header ──────────────────────────────────────────────────────────── */

.emoji-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border, #d0d0d0);
  background: var(--bg-secondary, #f5f5f5);
}

.emoji-title {
  font-weight: 600;
  font-size: 13px;
  color: var(--text-secondary, #666);
}

/* ─── Search ──────────────────────────────────────────────────────────── */

.emoji-search-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border, #d0d0d0);
}

.emoji-search-icon {
  font-size: 14px;
  flex-shrink: 0;
}

#emoji-search {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid var(--border, #d0d0d0);
  border-radius: 4px;
  background: var(--bg-secondary, #f5f5f5);
  color: var(--text, #1a1a1a);
  font-size: 13px;
  outline: none;
  font-family: inherit;
}

#emoji-search:focus {
  border-color: var(--accent, #4a90d9);
}

#emoji-search::placeholder {
  color: var(--text-muted, #999);
}

/* ─── Toast ───────────────────────────────────────────────────────────── */

#emoji-toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 20px;
  background: var(--accent, #4a90d9);
  color: #fff;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  animation: emoji-fade-in 0.15s ease;
}

#emoji-toast.emoji-toast-error {
  background: var(--danger, #e74c3c);
}

@keyframes emoji-fade-in {
  from { opacity: 0; transform: translateX(-50%) translateY(8px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}

/* ─── Grid ────────────────────────────────────────────────────────────── */

#emoji-grid {
  max-height: 50vh;
  overflow-y: auto;
}

.emoji-section {
  padding: 4px 0;
}

.emoji-category {
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted, #999);
  background: var(--bg, #fff);
  position: sticky;
  top: 0;
  z-index: 1;
  border-bottom: 1px solid var(--border, #eee);
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));
  gap: 2px;
  padding: 4px 8px;
}

.emoji-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 1;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: none;
  font-size: 24px;
  cursor: pointer;
  transition: background 0.1s, transform 0.1s;
  line-height: 1;
}

.emoji-cell:hover {
  background: var(--bg-tertiary, #e8e8e8);
  transform: scale(1.2);
  z-index: 2;
}

.emoji-cell:active {
  transform: scale(0.95);
}

.emoji-cell.copied {
  animation: emoji-pop 0.3s ease;
}

@keyframes emoji-pop {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.4); background: var(--bg-tertiary, #e8e8e8); }
  100% { transform: scale(1); }
}

.emoji-no-results {
  padding: 40px 16px;
  text-align: center;
  color: var(--text-muted, #999);
  font-size: 14px;
}

/* ─── Buttons ─────────────────────────────────────────────────────────── */

.emoji-btn {
  padding: 5px 10px;
  border: 1px solid var(--border, #d0d0d0);
  border-radius: 4px;
  background: var(--bg-secondary, #f5f5f5);
  color: var(--text, #1a1a1a);
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  font-family: inherit;
  line-height: 1;
}

.emoji-btn:hover {
  background: var(--bg-tertiary, #e8e8e8);
}

.emoji-btn-small {
  padding: 2px 6px;
  font-size: 11px;
}

/* ─── Recently used ───────────────────────────────────────────────────── */

#emoji-recent {
  border-top: 1px solid var(--border, #d0d0d0);
}

.emoji-recent-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted, #999);
  background: var(--bg-secondary, #f5f5f5);
  border-bottom: 1px solid var(--border, #d0d0d0);
}

#emoji-recent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));
  gap: 2px;
  padding: 6px 8px;
  max-height: 120px;
  overflow-y: auto;
}

/* ─── Dark mode ───────────────────────────────────────────────────────── */

@media (prefers-color-scheme: dark) {
  #emoji-root {
    --border: #444;
    --bg: #1e1e1e;
    --bg-secondary: #2a2a2a;
    --bg-tertiary: #333;
    --text: #e0e0e0;
    --text-secondary: #999;
    --text-muted: #777;
    --accent: #4a90d9;
    --danger: #e74c3c;
  }

  .emoji-category {
    background: #1e1e1e;
  }
}
</style>
