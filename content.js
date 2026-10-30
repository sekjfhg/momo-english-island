window.MOMO_DATA = (() => {
  const wordRows = [
    ["hello", "/həˈləʊ/", "int. 你好", "小学", "问候", "👋", "见面挥挥手：hello，先送出一个微笑。", "Hello! Nice to meet you.", "你好！很高兴认识你。"],
    ["goodbye", "/ˌɡʊdˈbaɪ/", "int. 再见", "小学", "问候", "🙋", "good + bye：带着好心情说再见。", "Goodbye! See you tomorrow.", "再见！明天见。"],
    ["please", "/pliːz/", "adv. 请", "小学", "礼貌", "🙏", "把 please 放进请求里，语气立刻更礼貌。", "A glass of water, please.", "请给我一杯水。"],
    ["thank", "/θæŋk/", "v. 感谢", "小学", "礼貌", "💛", "别人帮了你，用 thank 把谢意送出去。", "Thank you for your help.", "谢谢你的帮助。"],
    ["sorry", "/ˈsɒri/", "adj. 抱歉的", "小学", "礼貌", "🥺", "小小的 sorry，是修补关系的创可贴。", "Sorry, I am late.", "对不起，我迟到了。"],
    ["morning", "/ˈmɔːnɪŋ/", "n. 早晨", "小学", "时间", "🌅", "morning 的第一缕阳光，配一句 Good morning。", "I read English every morning.", "我每天早晨读英语。"],
    ["weather", "/ˈweðə(r)/", "n. 天气", "小学", "天气", "⛅", "weather 和 whether 同音，天气变化总让人犹豫。", "The weather is nice today.", "今天天气很好。"],
    ["family", "/ˈfæməli/", "n. 家庭；家人", "小学", "家庭", "👨‍👩‍👧", "家人围在一起，就是一个 family。", "My family has dinner together.", "我的家人一起吃晚饭。"],
    ["friend", "/frend/", "n. 朋友", "小学", "关系", "🧑‍🤝‍🧑", "friend 的结尾像 end：真正的朋友会陪你到最后。", "She is my best friend.", "她是我最好的朋友。"],
    ["school", "/skuːl/", "n. 学校", "小学", "校园", "🏫", "school 里有书声，也有一起成长的人。", "I walk to school every day.", "我每天步行去学校。"],
    ["teacher", "/ˈtiːtʃə(r)/", "n. 教师", "小学", "校园", "🧑‍🏫", "teach + er：带来知识的人。", "Our teacher explains it clearly.", "我们的老师把它解释得很清楚。"],
    ["student", "/ˈstjuːdnt/", "n. 学生", "小学", "校园", "🎒", "study + ent：正在学习的人。", "Every student has a notebook.", "每个学生都有一本笔记本。"],
    ["book", "/bʊk/", "n. 书；v. 预订", "小学", "学习", "📚", "读一本 book，也可以 book 一间房。", "This book is easy to read.", "这本书很容易读。"],
    ["pencil", "/ˈpensl/", "n. 铅笔", "小学", "学习", "✏️", "pencil 躺在桌上，等你写下第一句英文。", "May I borrow your pencil?", "我可以借你的铅笔吗？"],
    ["apple", "/ˈæpl/", "n. 苹果", "小学", "食物", "🍎", "apple 的第一音 /æ/，嘴巴要张大一点。", "I eat an apple after lunch.", "午饭后我吃一个苹果。"],
    ["water", "/ˈwɔːtə(r)/", "n. 水", "小学", "食物", "💧", "water 流进杯子，也流进身体的每个角落。", "Can I have some water?", "可以给我一些水吗？"],
    ["milk", "/mɪlk/", "n. 牛奶", "小学", "食物", "🥛", "milk 短促的 /ɪ/，像轻轻吸一口牛奶。", "I drink milk at breakfast.", "我早餐喝牛奶。"],
    ["bread", "/bred/", "n. 面包", "小学", "食物", "🍞", "bread 和 red 押韵，是早餐桌上的红色果酱搭档。", "The bread smells good.", "面包闻起来很香。"],
    ["breakfast", "/ˈbrekfəst/", "n. 早餐", "小学", "食物", "🍳", "break + fast：打破一夜的空腹。", "Breakfast gives me energy.", "早餐给我能量。"],
    ["home", "/həʊm/", "n. 家；adv. 回家", "小学", "生活", "🏠", "home 不只是房子，是灯亮着等你的地方。", "I go home at five.", "我五点回家。"],
    ["room", "/ruːm/", "n. 房间；空间", "小学", "生活", "🛋️", "room 里既能放家具，也能给想法留空间。", "There is a desk in my room.", "我房间里有一张书桌。"],
    ["bed", "/bed/", "n. 床", "小学", "生活", "🛏️", "忙碌一天，bed 是最柔软的终点。", "I go to bed at ten.", "我十点上床睡觉。"],
    ["happy", "/ˈhæpi/", "adj. 开心的", "小学", "情绪", "😄", "happy 的嘴角向上，像画面里的笑脸。", "I am happy to see you.", "见到你我很开心。"],
    ["tired", "/ˈtaɪəd/", "adj. 疲倦的", "小学", "情绪", "😴", "tired 时，给大脑一个休息按钮。", "I feel tired after school.", "放学后我觉得很累。"],
    ["hungry", "/ˈhʌŋɡri/", "adj. 饥饿的", "小学", "情绪", "🤤", "hungry 时肚子咕咕叫，先问 What’s for dinner?", "I am hungry now.", "我现在饿了。"],
    ["big", "/bɪɡ/", "adj. 大的", "小学", "描述", "🐘", "big 像大象张开身体，占据很多空间。", "That is a big dog.", "那是一只大狗。"],
    ["small", "/smɔːl/", "adj. 小的", "小学", "描述", "🐭", "small 里的 o 小小圆圆，像一颗豆子。", "This cup is small.", "这个杯子很小。"],
    ["hot", "/hɒt/", "adj. 热的；辣的", "小学", "天气", "🔥", "hot 不只是天气热，辣得冒火也能说 hot。", "It is hot today.", "今天很热。"],
    ["cold", "/kəʊld/", "adj. 寒冷的", "小学", "天气", "🧣", "cold 时围上围巾，说一句 It’s cold。", "The water is very cold.", "水很冷。"],
    ["play", "/pleɪ/", "v. 玩；演奏", "小学", "动作", "⚽", "play 是生活里的快乐动词：play ball, play music。", "Let’s play after class.", "下课后我们一起玩吧。"],

    ["travel", "/ˈtrævl/", "v. 旅行；n. 旅行", "初中", "出行", "🧳", "travel 让地图上的线，变成你走过的路。", "I want to travel around China.", "我想在中国各地旅行。"],
    ["journey", "/ˈdʒɜːni/", "n. 旅程", "初中", "出行", "🚆", "journey 更强调从出发到抵达的过程。", "The train journey takes two hours.", "这趟火车旅程需要两个小时。"],
    ["ticket", "/ˈtɪkɪt/", "n. 票；罚单", "初中", "出行", "🎫", "ticket 是通往下一站的钥匙。", "I bought a ticket online.", "我在网上买了一张票。"],
    ["station", "/ˈsteɪʃn/", "n. 车站", "初中", "出行", "🚉", "station 是停留，也是重新出发的地方。", "Meet me at the station.", "在车站和我碰面。"],
    ["airport", "/ˈeəpɔːt/", "n. 机场", "初中", "出行", "✈️", "air + port：天空中的港口。", "The airport is far from here.", "机场离这里很远。"],
    ["health", "/helθ/", "n. 健康", "初中", "健康", "❤️‍🩹", "health 是每天好好吃饭、睡觉和运动的存款。", "Sleep is important for health.", "睡眠对健康很重要。"],
    ["exercise", "/ˈeksəsaɪz/", "n./v. 锻炼", "初中", "健康", "🏃", "exercise 让身体醒过来，也让心情亮起来。", "I exercise three times a week.", "我每周锻炼三次。"],
    ["habit", "/ˈhæbɪt/", "n. 习惯", "初中", "生活", "🔁", "habit 是重复出来的隐形轨道，好习惯要慢慢铺。", "Reading is a good habit.", "阅读是一个好习惯。"],
    ["hobby", "/ˈhɒbi/", "n. 爱好", "初中", "兴趣", "🎸", "hobby 是给生活加一点自己的颜色。", "My hobby is taking photos.", "我的爱好是拍照。"],
    ["music", "/ˈmjuːzɪk/", "n. 音乐", "初中", "兴趣", "🎧", "music 一响，心里的节拍就开始工作。", "I listen to music on the bus.", "我在公交车上听音乐。"],
    ["painting", "/ˈpeɪntɪŋ/", "n. 绘画；画作", "初中", "兴趣", "🎨", "painting 用颜色把脑海里的画面搬到纸上。", "She is good at painting.", "她擅长画画。"],
    ["practice", "/ˈpræktɪs/", "n./v. 练习", "初中", "学习", "🎯", "practice 像把不会变成会的魔法，但需要每天施一次。", "Practice makes speaking easier.", "练习让开口变得更容易。"],
    ["borrow", "/ˈbɒrəʊ/", "v. 借入", "初中", "校园", "🤲", "borrow 是向别人借进来，lend 是借出去。", "May I borrow your pen?", "我可以借你的钢笔吗？"],
    ["return", "/rɪˈtɜːn/", "v. 返回；归还", "初中", "校园", "↩️", "re + turn：转回来，东西和人都适用。", "Please return the book by Friday.", "请在周五前归还这本书。"],
    ["invite", "/ɪnˈvaɪt/", "v. 邀请", "初中", "社交", "💌", "invite 是递出一张进入你生活的入场券。", "I invited my friend to dinner.", "我邀请朋友吃晚饭。"],
    ["arrive", "/əˈraɪv/", "v. 到达", "初中", "出行", "📍", "arrive 之后，用 at 小地点、in 大地点。", "We arrive at nine.", "我们九点到达。"],
    ["prepare", "/prɪˈpeə(r)/", "v. 准备", "初中", "行动", "🧰", "prepare 是提前把麻烦搬到昨天处理。", "I prepare my bag before bed.", "我睡前准备好书包。"],
    ["decide", "/dɪˈsaɪd/", "v. 决定", "初中", "行动", "⚖️", "decide 像在两条路之间落下一枚硬币。", "I decided to walk home.", "我决定走路回家。"],
    ["improve", "/ɪmˈpruːv/", "v. 改善；提高", "初中", "学习", "📈", "improve 是今天比昨天多会一点点。", "Reading can improve your English.", "阅读能提高你的英语。"],
    ["protect", "/prəˈtekt/", "v. 保护", "初中", "环境", "🛡️", "protect 像给重要的人和地方撑起一把伞。", "We should protect wild animals.", "我们应该保护野生动物。"],
    ["environment", "/ɪnˈvaɪrənmənt/", "n. 环境", "初中", "环境", "🌍", "environment 是我们共同生活的大房子。", "We need a clean environment.", "我们需要洁净的环境。"],
    ["pollution", "/pəˈluːʃn/", "n. 污染", "初中", "环境", "🏭", "pollution 让城市戴上灰色的口罩。", "Air pollution harms our health.", "空气污染危害健康。"],
    ["recycle", "/ˌriːˈsaɪkl/", "v. 回收利用", "初中", "环境", "♻️", "re + cycle：让物品重新进入循环。", "We recycle paper and bottles.", "我们回收纸张和瓶子。"],
    ["volunteer", "/ˌvɒlənˈtɪə(r)/", "n. 志愿者；v. 自愿做", "初中", "公益", "🤝", "volunteer 不拿报酬，也能收获真实的连接。", "She volunteers at the library.", "她在图书馆做志愿者。"],
    ["communicate", "/kəˈmjuːnɪkeɪt/", "v. 交流；沟通", "初中", "沟通", "💬", "communicate 不是把话说完，而是让对方真正听懂。", "We communicate by message.", "我们通过消息交流。"],
    ["advice", "/ədˈvaɪs/", "n. 建议", "初中", "沟通", "💡", "advice 是不可数名词，不能加 s；动词是 advise。", "Thanks for your advice.", "谢谢你的建议。"],
    ["difficult", "/ˈdɪfɪkəlt/", "adj. 困难的", "初中", "学习", "🧩", "difficult 是一块拼图，暂时没找到位置而已。", "The question is difficult but useful.", "这个问题很难，但有用。"],
    ["important", "/ɪmˈpɔːtnt/", "adj. 重要的", "初中", "生活", "⭐", "important 的事值得放进今天的清单。", "It is important to ask questions.", "提问很重要。"],
    ["experience", "/ɪkˈspɪəriəns/", "n. 经历；经验", "初中", "成长", "🪁", "experience 是走过的路，最后变成你的底气。", "The trip was a new experience.", "那次旅行是一次新经历。"],
    ["future", "/ˈfjuːtʃə(r)/", "n. 未来", "初中", "计划", "🌱", "future 从今天的小选择里长出来。", "What do you want to do in the future?", "你将来想做什么？"],

    ["achieve", "/əˈtʃiːv/", "v. 达到；实现", "高中", "成长", "🏔️", "achieve 是每天向上一步，最后站上山顶。", "Small steps help us achieve our goals.", "小步前进帮助我们实现目标。"],
    ["challenge", "/ˈtʃælɪndʒ/", "n. 挑战；v. 挑战", "高中", "成长", "🧗", "challenge 不是墙，而是让你变强的训练场。", "Learning to speak is a challenge worth taking.", "学会开口是一项值得接受的挑战。"],
    ["opportunity", "/ˌɒpəˈtjuːnəti/", "n. 机会", "高中", "成长", "🚪", "opportunity 是一扇门，看见时先试着推开。", "Volunteering gives us an opportunity to help.", "志愿服务给我们帮助他人的机会。"],
    ["responsibility", "/rɪˌspɒnsəˈbɪləti/", "n. 责任", "高中", "成长", "🧭", "response + ability：有能力回应，就是承担责任。", "Taking care of the environment is our responsibility.", "保护环境是我们的责任。"],
    ["independent", "/ˌɪndɪˈpendənt/", "adj. 独立的", "高中", "成长", "🌳", "independent 像一棵自己的根扎稳的树。", "Learning makes us more independent.", "学习让我们更加独立。"],
    ["cooperate", "/kəʊˈɒpəreɪt/", "v. 合作", "高中", "沟通", "🧩", "co + operate：一起把事情运转起来。", "The two teams cooperated well.", "两个团队合作得很好。"],
    ["influence", "/ˈɪnfluəns/", "n./v. 影响", "高中", "社会", "🌊", "influence 像一圈水波，会传到很远。", "Friends can influence our choices.", "朋友会影响我们的选择。"],
    ["contribute", "/kənˈtrɪbjuːt/", "v. 贡献；促成", "高中", "社会", "🪴", "contribute 是把自己的一瓢水加进共同的池子。", "Everyone can contribute to the project.", "每个人都能为这个项目作贡献。"],
    ["appreciate", "/əˈpriːʃieɪt/", "v. 欣赏；感激", "高中", "沟通", "🌻", "appreciate 不只看见好，还愿意说出谢谢。", "I appreciate your patience.", "我感谢你的耐心。"],
    ["perspective", "/pəˈspektɪv/", "n. 观点；视角", "高中", "思维", "🔭", "perspective 是站到另一扇窗看同一片天空。", "Travel gives us a new perspective.", "旅行给我们新的视角。"],
    ["maintain", "/meɪnˈteɪn/", "v. 维持；保养", "高中", "生活", "🛠️", "maintain 是让好状态不在忙碌里掉线。", "It is hard to maintain a healthy habit.", "保持健康习惯并不容易。"],
    ["adapt", "/əˈdæpt/", "v. 适应；改编", "高中", "成长", "🦎", "adapt 像变色龙找到适合当下的颜色。", "We adapt quickly to new situations.", "我们很快适应新环境。"],
    ["efficient", "/ɪˈfɪʃnt/", "adj. 高效的", "高中", "学习", "⚡", "efficient 不是做得更多，而是浪费得更少。", "A clear plan makes study more efficient.", "清晰的计划让学习更高效。"],
    ["creative", "/kriˈeɪtɪv/", "adj. 有创造力的", "高中", "思维", "💡", "creative 是把 A 和 B 碰在一起，生出 C。", "Try a creative way to remember words.", "尝试一种有创意的记词方法。"],
    ["convey", "/kənˈveɪ/", "v. 表达；传达", "高中", "沟通", "📣", "convey 是把心里的意思稳稳送到对方那里。", "A smile can convey kindness.", "一个微笑可以传达善意。"],
    ["sustainable", "/səˈsteɪnəbl/", "adj. 可持续的", "高中", "环境", "🌿", "sustainable 的好，不只今天好，明天也能继续。", "We need sustainable ways to travel.", "我们需要可持续的出行方式。"],
    ["consume", "/kənˈsjuːm/", "v. 消耗；消费", "高中", "社会", "🔋", "consume 像电池放电，要注意用了多少、用了什么。", "Phones consume a lot of attention.", "手机消耗大量注意力。"],
    ["consequence", "/ˈkɒnsɪkwəns/", "n. 后果；结果", "高中", "思维", "🪃", "consequence 像回旋镖，选择迟早会回到眼前。", "Every choice has a consequence.", "每个选择都有后果。"],
    ["evidence", "/ˈevɪdəns/", "n. 证据", "高中", "思维", "🔎", "evidence 是让观点站稳的证据砖块。", "Look for evidence in the text.", "在文本中寻找证据。"],
    ["interpret", "/ɪnˈtɜːprɪt/", "v. 解释；理解", "高中", "思维", "🗺️", "interpret 是给一段信息找到最合适的路线。", "People may interpret the same words differently.", "人们可能对同样的话有不同理解。"],
    ["relate", "/rɪˈleɪt/", "v. 联系；有关", "高中", "思维", "🔗", "relate 是把新知识挂到旧知识的钩子上。", "I relate this word to my daily life.", "我把这个词和日常生活联系起来。"],
    ["reflect", "/rɪˈflekt/", "v. 反思；反映", "高中", "成长", "🪞", "reflect 像照镜子，看见自己的选择和变化。", "Take time to reflect on your progress.", "花时间反思你的进步。"],
    ["motivate", "/ˈməʊtɪveɪt/", "v. 激励；促使", "高中", "成长", "🚀", "motivate 是给心里的发动机点一把火。", "Small wins motivate us to continue.", "小小的胜利激励我们继续前进。"],
    ["potential", "/pəˈtenʃl/", "n. 潜能；adj. 潜在的", "高中", "成长", "🌰", "potential 是种子里的整片森林。", "Everyone has the potential to improve.", "每个人都有进步的潜能。"],
    ["significant", "/sɪɡˈnɪfɪkənt/", "adj. 重要的；显著的", "高中", "思维", "📌", "significant 表示值得被圈出来的重要变化。", "There was a significant improvement.", "有了显著的进步。"],
    ["approach", "/əˈprəʊtʃ/", "n. 方法；v. 接近", "高中", "学习", "🛤️", "approach 是你走向问题的方式，也是一条路。", "Try a different approach to learning.", "尝试不同的学习方法。"],
    ["balance", "/ˈbæləns/", "n./v. 平衡", "高中", "生活", "⚖️", "balance 是学习和休息各站在跷跷板一端。", "Try to balance study and rest.", "试着平衡学习和休息。"],
    ["aware", "/əˈweə(r)/", "adj. 意识到的", "高中", "思维", "👀", "aware 是把容易忽略的事放进视野。", "Be aware of how you spend your time.", "留意你如何花时间。"],
    ["confident", "/ˈkɒnfɪdənt/", "adj. 自信的", "高中", "成长", "💪", "confident 来自一次次“我做到了”。", "Practice helps you feel confident.", "练习让你更自信。"],
    ["curious", "/ˈkjʊəriəs/", "adj. 好奇的", "高中", "成长", "🔍", "curious 的人会多问一句为什么，于是世界变大。", "Stay curious about new words.", "对新单词保持好奇。"]
  ];

  const words = wordRows.map((row, index) => ({
    id: `w-${String(index + 1).padStart(3, "0")}`,
    word: row[0],
    ipa: row[1],
    meaning: row[2],
    level: row[3],
    theme: row[4],
    emoji: row[5],
    memory: row[6],
    example: row[7],
    translation: row[8],
    colorIndex: index % 6
  }));

  const phonetics = [
    { symbol: "iː", type: "元音", subtype: "长元音", word: "sheep", zh: "绵羊", tip: "嘴角向两边拉开，像微笑，声音持续而明亮。" },
    { symbol: "ɪ", type: "元音", subtype: "短元音", word: "ship", zh: "船", tip: "嘴角放松，短促有力，不要拖成长音。" },
    { symbol: "e", type: "元音", subtype: "短元音", word: "bed", zh: "床", tip: "嘴巴自然张开，舌尖靠近下齿。" },
    { symbol: "æ", type: "元音", subtype: "短元音", word: "apple", zh: "苹果", tip: "嘴巴明显张大，像准备咬一口苹果。" },
    { symbol: "ɑː", type: "元音", subtype: "长元音", word: "car", zh: "汽车", tip: "嘴巴张大，舌头后缩，声音拉长。" },
    { symbol: "ɒ", type: "元音", subtype: "短元音", word: "hot", zh: "热的", tip: "嘴唇略圆，舌头后缩，声音短。" },
    { symbol: "ɔː", type: "元音", subtype: "长元音", word: "door", zh: "门", tip: "嘴唇收圆，舌头后缩，声音饱满。" },
    { symbol: "ʊ", type: "元音", subtype: "短元音", word: "book", zh: "书", tip: "嘴唇轻轻收圆，声音短而放松。" },
    { symbol: "uː", type: "元音", subtype: "长元音", word: "food", zh: "食物", tip: "嘴唇收成小圆，舌头后缩，声音拉长。" },
    { symbol: "ʌ", type: "元音", subtype: "短元音", word: "cup", zh: "杯子", tip: "嘴巴半开，舌头居中，短促自然。" },
    { symbol: "ɜː", type: "元音", subtype: "长元音", word: "bird", zh: "鸟", tip: "嘴唇放松，舌头居中，声音平稳拉长。" },
    { symbol: "ə", type: "元音", subtype: "弱元音", word: "about", zh: "关于", tip: "最放松的轻声，嘴唇和舌头都不要用力。" },
    { symbol: "eɪ", type: "元音", subtype: "双元音", word: "name", zh: "名字", tip: "从 /e/ 滑向 /ɪ/，像一条短小的上坡路。" },
    { symbol: "aɪ", type: "元音", subtype: "双元音", word: "time", zh: "时间", tip: "从张口到收小，声音向前滑。" },
    { symbol: "ɔɪ", type: "元音", subtype: "双元音", word: "boy", zh: "男孩", tip: "从圆唇滑向 /ɪ/，下巴逐渐抬起。" },
    { symbol: "aʊ", type: "元音", subtype: "双元音", word: "house", zh: "房子", tip: "先张大口，再把嘴唇收圆。" },
    { symbol: "əʊ", type: "元音", subtype: "双元音", word: "go", zh: "去", tip: "从放松的 /ə/ 滑向 /ʊ/，嘴唇慢慢收圆。" },
    { symbol: "ɪə", type: "元音", subtype: "双元音", word: "near", zh: "附近", tip: "短 /ɪ/ 后滑向轻声 /ə/。" },
    { symbol: "eə", type: "元音", subtype: "双元音", word: "hair", zh: "头发", tip: "先发 /e/，再放松滑向 /ə/。" },
    { symbol: "ʊə", type: "元音", subtype: "双元音", word: "tour", zh: "旅行", tip: "短 /ʊ/ 后滑向中央的 /ə/。" },

    { symbol: "p", type: "辅音", subtype: "爆破音", word: "pen", zh: "钢笔", tip: "双唇闭合后突然放开，几乎没有气流声。" },
    { symbol: "b", type: "辅音", subtype: "爆破音", word: "bag", zh: "包", tip: "双唇爆破，同时喉咙轻微振动。" },
    { symbol: "t", type: "辅音", subtype: "爆破音", word: "time", zh: "时间", tip: "舌尖抵上齿龈后迅速放开。" },
    { symbol: "d", type: "辅音", subtype: "爆破音", word: "day", zh: "白天", tip: "与 /t/ 口型相同，但喉咙要振动。" },
    { symbol: "k", type: "辅音", subtype: "爆破音", word: "cat", zh: "猫", tip: "舌根抵住软腭，蓄气后迅速放开。" },
    { symbol: "ɡ", type: "辅音", subtype: "爆破音", word: "go", zh: "去", tip: "与 /k/ 口型相同，但声带振动。" },
    { symbol: "f", type: "辅音", subtype: "摩擦音", word: "fish", zh: "鱼", tip: "上齿轻触下唇，让气流从缝隙擦出。" },
    { symbol: "v", type: "辅音", subtype: "摩擦音", word: "voice", zh: "声音", tip: "/f/ 的口型加上声带振动。" },
    { symbol: "θ", type: "辅音", subtype: "摩擦音", word: "think", zh: "思考", tip: "舌尖轻放在上下齿之间送气，不咬紧。" },
    { symbol: "ð", type: "辅音", subtype: "摩擦音", word: "this", zh: "这个", tip: "与 /θ/ 口型相同，但要加入声带振动。" },
    { symbol: "s", type: "辅音", subtype: "摩擦音", word: "sun", zh: "太阳", tip: "舌尖靠近上齿龈，像轻轻说“嘶”。" },
    { symbol: "z", type: "辅音", subtype: "摩擦音", word: "zoo", zh: "动物园", tip: "/s/ 的口型加上持续振动。" },
    { symbol: "ʃ", type: "辅音", subtype: "摩擦音", word: "ship", zh: "船", tip: "嘴唇略突出，像让别人安静时的“嘘”。" },
    { symbol: "ʒ", type: "辅音", subtype: "摩擦音", word: "vision", zh: "视野", tip: "/ʃ/ 的口型加上声带振动。" },
    { symbol: "h", type: "辅音", subtype: "摩擦音", word: "hat", zh: "帽子", tip: "口型随后面的元音变化，像哈气一样送气。" },
    { symbol: "tʃ", type: "辅音", subtype: "破擦音", word: "chair", zh: "椅子", tip: "先像 /t/ 蓄气，再滑入 /ʃ/。" },
    { symbol: "dʒ", type: "辅音", subtype: "破擦音", word: "job", zh: "工作", tip: "先像 /d/，再滑入 /ʒ/，声带振动。" },
    { symbol: "m", type: "辅音", subtype: "鼻音", word: "man", zh: "男人", tip: "双唇闭合，声音从鼻腔流出。" },
    { symbol: "n", type: "辅音", subtype: "鼻音", word: "no", zh: "不", tip: "舌尖抵上齿龈，声音从鼻腔流出。" },
    { symbol: "ŋ", type: "辅音", subtype: "鼻音", word: "sing", zh: "唱歌", tip: "舌根抬起，嘴唇放松，声音在鼻腔共鸣。" },
    { symbol: "l", type: "辅音", subtype: "边音", word: "light", zh: "光", tip: "舌尖抵上齿龈，气流从舌头两边通过。" },
    { symbol: "r", type: "辅音", subtype: "近音", word: "red", zh: "红色", tip: "舌尖悬空、略卷，不要碰硬腭。" },
    { symbol: "j", type: "辅音", subtype: "半元音", word: "yes", zh: "是的", tip: "舌头靠近硬腭，快速滑向后面的元音。" },
    { symbol: "w", type: "辅音", subtype: "半元音", word: "we", zh: "我们", tip: "双唇收圆后迅速打开。" },
    { symbol: "tr", type: "辅音", subtype: "连缀", word: "tree", zh: "树", tip: "传统音标表把 /tr/ 作为整体练习，先 /t/ 再快速滑向 /r/。" },
    { symbol: "dr", type: "辅音", subtype: "连缀", word: "dream", zh: "梦想", tip: "先 /d/ 再滑向 /r/，声带保持振动。" },
    { symbol: "ts", type: "辅音", subtype: "连缀", word: "cats", zh: "猫（复数）", tip: "先 /t/ 再快速滑向 /s/。" },
    { symbol: "dz", type: "辅音", subtype: "连缀", word: "beds", zh: "床（复数）", tip: "先 /d/ 再滑向 /z/，声带振动。" }
  ].map((item, index) => ({ ...item, id: `p-${index + 1}` }));

  const grammarLessons = [
    {
      id: "g-be",
      title: "be 动词",
      en: "I am / You are",
      badge: "句型底座",
      color: "mint",
      form: "主语 + am / is / are + 名词或形容词",
      use: "用来说明“我是谁、在哪里、怎么样”。日常介绍、描述天气和感受都离不开它。",
      signals: ["I am", "you / we / they are", "he / she / it is"],
      examples: [
        { en: "I am a student.", zh: "我是一名学生。" },
        { en: "She is at home.", zh: "她在家。" },
        { en: "They are happy.", zh: "他们很开心。" }
      ],
      quiz: [
        { q: "I ___ ready to go.", options: ["am", "is", "are"], answer: 0, explain: "主语是 I，be 动词用 am。" },
        { q: "The coffee ___ hot.", options: ["am", "is", "are"], answer: 1, explain: "The coffee 是第三人称单数，用 is。" }
      ]
    },
    {
      id: "g-present",
      title: "一般现在时",
      en: "Present Simple",
      badge: "每日习惯",
      color: "sky",
      form: "主语 + 动词原形；第三人称单数 + 动词加 -s/-es",
      use: "说习惯、事实和固定安排。比如每天几点起床、喜欢什么、店几点开门。",
      signals: ["always", "usually", "every day", "sometimes"],
      examples: [
        { en: "I drink coffee every morning.", zh: "我每天早晨喝咖啡。" },
        { en: "She works at a hospital.", zh: "她在医院工作。" },
        { en: "The shop opens at nine.", zh: "商店九点开门。" }
      ],
      quiz: [
        { q: "He ___ English every day.", options: ["study", "studies", "studying"], answer: 1, explain: "He 是第三人称单数，study 变 studies。" },
        { q: "Which word often signals this tense?", options: ["yesterday", "usually", "tomorrow"], answer: 1, explain: "usually 表示经常发生，常与一般现在时连用。" }
      ]
    },
    {
      id: "g-continuous",
      title: "现在进行时",
      en: "Present Continuous",
      badge: "正在发生",
      color: "coral",
      form: "am / is / are + 动词 -ing",
      use: "说此刻正在做的事，也可以说近期临时安排。点餐时说“我在等朋友”就用它。",
      signals: ["now", "right now", "look!", "at the moment"],
      examples: [
        { en: "I am waiting for a friend.", zh: "我正在等朋友。" },
        { en: "She is making coffee.", zh: "她正在冲咖啡。" },
        { en: "We are going to Beijing tomorrow.", zh: "我们明天要去北京。" }
      ],
      quiz: [
        { q: "Look! It ___ outside.", options: ["rains", "is raining", "rained"], answer: 1, explain: "Look! 提示事情正在发生，用现在进行时。" },
        { q: "They are ___ dinner.", options: ["have", "having", "had"], answer: 1, explain: "are 后接动词 -ing：having。" }
      ]
    },
    {
      id: "g-past",
      title: "一般过去时",
      en: "Past Simple",
      badge: "讲故事",
      color: "sun",
      form: "主语 + 动词过去式",
      use: "说已经结束的动作和经历。讲故事、回忆旅行、描述昨天发生了什么都用它。",
      signals: ["yesterday", "last week", "ago", "in 2020"],
      examples: [
        { en: "I visited my grandmother yesterday.", zh: "我昨天去看望了奶奶。" },
        { en: "We went to the museum last week.", zh: "我们上周去了博物馆。" },
        { en: "The meal was delicious.", zh: "那顿饭很好吃。" }
      ],
      quiz: [
        { q: "I ___ a movie last night.", options: ["watch", "watched", "am watching"], answer: 1, explain: "last night 表示过去，watch 变 watched。" },
        { q: "What is the past form of go?", options: ["goed", "went", "gone"], answer: 1, explain: "go 的过去式是不规则变化 went。" }
      ]
    },
    {
      id: "g-future",
      title: "一般将来时",
      en: "Future: will / be going to",
      badge: "计划与预测",
      color: "blue",
      form: "will + 动词原形；am / is / are going to + 动词原形",
      use: "will 表示即时决定或预测；be going to 更常表示已经想好的计划。",
      signals: ["tomorrow", "next week", "soon", "in the future"],
      examples: [
        { en: "I will call you tonight.", zh: "我今晚会给你打电话。" },
        { en: "We are going to visit Hangzhou.", zh: "我们打算去杭州。" },
        { en: "It will be sunny tomorrow.", zh: "明天会是晴天。" }
      ],
      quiz: [
        { q: "I ___ help you with that.", options: ["will", "was", "have"], answer: 0, explain: "即时决定帮忙，用 will + 动词原形。" },
        { q: "They are going to ___ a new shop.", options: ["opened", "open", "opening"], answer: 1, explain: "be going to 后接动词原形 open。" }
      ]
    },
    {
      id: "g-perfect",
      title: "现在完成时",
      en: "Present Perfect",
      badge: "经历与结果",
      color: "purple",
      form: "have / has + 过去分词",
      use: "说过去发生、但现在仍有关系的事。比如“我已经吃过”“你去过北京吗”。",
      signals: ["already", "yet", "ever", "never", "since", "for"],
      examples: [
        { en: "I have already had lunch.", zh: "我已经吃过午饭了。" },
        { en: "Have you ever been to Shanghai?", zh: "你去过上海吗？" },
        { en: "She has lived here for three years.", zh: "她在这里住了三年。" }
      ],
      quiz: [
        { q: "I have ___ my homework.", options: ["finish", "finished", "finishing"], answer: 1, explain: "have 后要用过去分词 finished。" },
        { q: "She has worked here ___ 2022.", options: ["for", "since", "ago"], answer: 1, explain: "since 后接时间点，for 后接一段时间。" }
      ]
    },
    {
      id: "g-past-cont",
      title: "过去进行时",
      en: "Past Continuous",
      badge: "过去进行中",
      color: "pink",
      form: "was / were + 动词 -ing",
      use: "说过去某一刻正在发生的事。常和 suddenly、when 连用，构成“我正……这时……”的故事。",
      signals: ["at 8 last night", "when", "while"],
      examples: [
        { en: "I was cooking when you called.", zh: "你打电话时我正在做饭。" },
        { en: "They were waiting outside.", zh: "他们当时正在外面等。" }
      ],
      quiz: [
        { q: "She ___ reading at eight.", options: ["is", "was", "were"], answer: 1, explain: "She 在过去的某一刻，be 动词用 was。" },
        { q: "We ___ walking home at that time.", options: ["was", "were", "are"], answer: 1, explain: "We 对应的过去 be 动词是 were。" }
      ]
    },
    {
      id: "g-modal",
      title: "can / must / should",
      en: "Everyday Modals",
      badge: "开口办事",
      color: "green",
      form: "情态动词 + 动词原形",
      use: "can 说能力或许可，must 说必须，should 说建议。问路、求助和表达规则很实用。",
      signals: ["can = 能 / 可以", "must = 必须", "should = 应该"],
      examples: [
        { en: "Can you help me?", zh: "你能帮我吗？" },
        { en: "You must show your ticket.", zh: "你必须出示车票。" },
        { en: "You should get some rest.", zh: "你应该休息一下。" }
      ],
      quiz: [
        { q: "You ___ drink more water.", options: ["should", "are", "did"], answer: 0, explain: "给出健康建议用 should。" },
        { q: "Can you ___ the door?", options: ["opened", "open", "opening"], answer: 1, explain: "情态动词后接动词原形。" }
      ]
    }
  ];

  const scenarios = [
    {
      id: "scene-greet",
      title: "第一次见面",
      subtitle: "问候与介绍",
      emoji: "👋",
      color: "coral",
      setting: "English Club",
      lines: [
        { speaker: "Mia", en: "Hi, I'm Mia. Are you new here?", zh: "嗨，我是米娅。你是新来的吗？" },
        { speaker: "You", en: "Yes, I am. My name is Lin.", zh: "是的。我叫林。" },
        { speaker: "Mia", en: "Nice to meet you. Where are you from?", zh: "很高兴认识你。你来自哪里？" },
        { speaker: "You", en: "I'm from Chengdu. It's nice to meet you too.", zh: "我来自成都。我也很高兴认识你。" }
      ],
      challenge: {
        q: "别人说 “Nice to meet you.”，你可以回答：",
        options: ["Nice to meet you too.", "I am fine, thank you.", "See you yesterday."],
        answer: 0,
        explain: "初次见面的固定礼貌回应是 Nice to meet you too."
      }
    },
    {
      id: "scene-cafe",
      title: "在咖啡店",
      subtitle: "点单与付款",
      emoji: "☕",
      color: "sun",
      setting: "Corner Café",
      lines: [
        { speaker: "Barista", en: "Good morning! What can I get for you?", zh: "早上好！您想要什么？" },
        { speaker: "You", en: "A latte, please. Can I have it with less sugar?", zh: "请给我一杯拿铁。可以少放点糖吗？" },
        { speaker: "Barista", en: "Of course. Is that for here or to go?", zh: "当然可以。在这儿喝还是带走？" },
        { speaker: "You", en: "To go, please. How much is it?", zh: "带走，谢谢。多少钱？" }
      ],
      challenge: {
        q: "你想把咖啡带走，应该说：",
        options: ["For here, please.", "To go, please.", "I am going home."],
        answer: 1,
        explain: "To go 表示食物或饮料打包带走。"
      }
    },
    {
      id: "scene-direction",
      title: "问路",
      subtitle: "方向与位置",
      emoji: "🗺️",
      color: "sky",
      setting: "City Street",
      lines: [
        { speaker: "You", en: "Excuse me, where is the nearest subway station?", zh: "打扰一下，最近的地铁站在哪里？" },
        { speaker: "Passerby", en: "Go straight and turn left at the bank.", zh: "直走，在银行处左转。" },
        { speaker: "You", en: "Is it far from here?", zh: "离这里远吗？" },
        { speaker: "Passerby", en: "No, it's about five minutes on foot.", zh: "不远，步行大约五分钟。" }
      ],
      challenge: {
        q: "“在银行处左转”怎么说？",
        options: ["Turn left at the bank.", "Turn right behind the bank.", "Go straight to the bank."],
        answer: 0,
        explain: "turn left at... 表示在某个地点左转。"
      }
    },
    {
      id: "scene-shop",
      title: "买衣服",
      subtitle: "尺码与价格",
      emoji: "👕",
      color: "purple",
      setting: "Weekend Market",
      lines: [
        { speaker: "You", en: "Do you have this shirt in a larger size?", zh: "这件衬衫有大一码的吗？" },
        { speaker: "Shop assistant", en: "Yes, here you are. Would you like to try it on?", zh: "有的，给您。您想试穿吗？" },
        { speaker: "You", en: "Yes, where is the fitting room?", zh: "想，试衣间在哪里？" },
        { speaker: "Shop assistant", en: "It's over there, next to the mirror.", zh: "在那边，镜子旁边。" }
      ],
      challenge: {
        q: "试穿衣服可以这样说：",
        options: ["Try on the shirt.", "Turn on the shirt.", "Take off the shop."],
        answer: 0,
        explain: "try on 是“试穿”，代词放中间时用 try it on。"
      }
    },
    {
      id: "scene-doctor",
      title: "身体不舒服",
      subtitle: "症状与建议",
      emoji: "🩺",
      color: "green",
      setting: "Community Clinic",
      lines: [
        { speaker: "Doctor", en: "What seems to be the problem?", zh: "您哪里不舒服？" },
        { speaker: "You", en: "I have a headache and a sore throat.", zh: "我头疼，喉咙也疼。" },
        { speaker: "Doctor", en: "How long have you felt like this?", zh: "这种情况持续多久了？" },
        { speaker: "You", en: "Since yesterday morning.", zh: "从昨天早上开始。" }
      ],
      challenge: {
        q: "告诉医生“我头疼”，应该说：",
        options: ["I have a headache.", "I am a headache.", "My head is doctor."],
        answer: 0,
        explain: "英语中表达疼痛常用 have a + 症状。"
      }
    },
    {
      id: "scene-hotel",
      title: "酒店入住",
      subtitle: "预订与需求",
      emoji: "🛎️",
      color: "blue",
      setting: "Harbor Hotel",
      lines: [
        { speaker: "You", en: "I have a reservation under the name Lin.", zh: "我用林这个名字预订了房间。" },
        { speaker: "Receptionist", en: "Could I see your passport, please?", zh: "请让我看一下您的护照好吗？" },
        { speaker: "You", en: "Here you are. What time is breakfast?", zh: "给您。早餐几点开始？" },
        { speaker: "Receptionist", en: "From seven to ten in the morning.", zh: "早上七点到十点。" }
      ],
      challenge: {
        q: "“我预订了房间”最自然的表达是：",
        options: ["I have a reservation.", "I am a reservation.", "I booked a passport."],
        answer: 0,
        explain: "have a reservation 是酒店语境中的常用表达。"
      }
    }
  ];

  const dailyTips = [
    "把新单词放进一句你今天真的会说的话里，比重复抄十遍更有用。",
    "听不清一个词时，别停下整句话。先抓住人物、动作和语气。",
    "看见实物就小声说出英文：水杯、门、公交卡，都是免费的词卡。",
    "记忆不是一次完成。今天会、明天忘，是大脑在提醒你再来一次。",
    "语法不是规则清单。先找到一句话在说什么，再问它是怎么组织起来的。",
    "练习口语时先追求“对方能听懂”，再追求“说得完美”。",
    "每日 10 分钟稳定复习，比周末一次学两小时更容易形成长期记忆。"
  ];

  return {
    words,
    phonetics,
    grammarLessons,
    scenarios,
    dailyTips,
    levels: ["小学", "初中", "高中"],
    wordThemes: [...new Set(words.map((word) => word.theme))]
  };
})();
