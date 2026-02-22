import React, { useState } from 'react';

const Instructions = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedCard, setExpandedCard] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { key: 'all', label: '📋 All', color: '#e94560' },
    { key: 'medical', label: '🏥 Medical', color: '#10b981' },
    { key: 'safety', label: '🛡️ Safety', color: '#3b82f6' },
    { key: 'women', label: '👩 Women', color: '#8b5cf6' },
    { key: 'disaster', label: '🌪️ Disaster', color: '#f97316' },
  ];

  const guides = [
    {
      id: 'cpr',
      category: 'medical',
      icon: '❤️',
      title: 'CPR (Cardiopulmonary Resuscitation)',
      subtitle: 'Restart heart & breathing',
      color: '#ff2d2d',
      urgent: true,
      steps: [
        { step: 'Check Safety', desc: 'Make sure the area is safe for you and the victim' },
        { step: 'Check Responsiveness', desc: 'Tap shoulders firmly and shout "Are you okay?"' },
        { step: 'Call for Help', desc: 'Call 108 immediately or ask someone nearby to call' },
        { step: 'Position the Person', desc: 'Lay them flat on their back on a firm surface' },
        { step: 'Open Airway', desc: 'Tilt head back gently and lift chin to open airway' },
        { step: 'Check Breathing', desc: 'Look, listen and feel for breathing for 10 seconds' },
        { step: 'Start Compressions', desc: 'Place heel of hand on center of chest, push down 2 inches hard and fast' },
        { step: 'Rate & Count', desc: 'Give 30 compressions at 100-120 per minute — like beating to "Stayin Alive"' },
        { step: 'Give Rescue Breaths', desc: 'Pinch nose shut, give 2 full rescue breaths into mouth' },
        { step: 'Repeat Cycle', desc: 'Continue 30 compressions + 2 breaths until help arrives' },
      ],
      tips: [
        '🔴 Do NOT stop compressions unless person recovers or help arrives',
        '💪 Push HARD — it is normal to feel ribs flex',
        '⏱️ Start CPR within 4 minutes to prevent brain damage',
        '🧤 Use gloves if available to protect yourself',
      ],
      callNumber: '108',
    },
    {
      id: 'bleeding',
      category: 'medical',
      icon: '🩸',
      title: 'Severe Bleeding Control',
      subtitle: 'Stop dangerous blood loss',
      color: '#e94560',
      urgent: true,
      steps: [
        { step: 'Protect Yourself', desc: 'Wear gloves or use plastic bags to avoid blood contact' },
        { step: 'Call Emergency', desc: 'Call 108 immediately for severe bleeding' },
        { step: 'Apply Pressure', desc: 'Press firmly on wound with clean cloth, bandage or clothing' },
        { step: 'Do NOT Remove', desc: 'Never remove the cloth — add more on top if blood soaks through' },
        { step: 'Elevate if Possible', desc: 'Raise the injured limb above the level of the heart' },
        { step: 'Hold Pressure', desc: 'Maintain firm pressure for at least 10-15 full minutes' },
        { step: 'Consider Tourniquet', desc: 'For limb bleeding — tie tight band 2 inches above wound' },
        { step: 'Note the Time', desc: 'Write the tourniquet application time on the skin' },
        { step: 'Keep Warm', desc: 'Cover victim with blanket to prevent shock' },
        { step: 'Reassure Victim', desc: 'Stay calm, talk to them, keep them conscious until help arrives' },
      ],
      tips: [
        '❌ NEVER use ice directly on open wounds',
        '❌ Do NOT probe or remove embedded objects',
        '✅ Internal bleeding signs: bruising, swollen abdomen, confusion',
        '⚠️ Watch for signs of shock: pale skin, rapid breathing, confusion',
      ],
      callNumber: '108',
    },
    {
      id: 'burns',
      category: 'medical',
      icon: '🔥',
      title: 'Burns Treatment',
      subtitle: 'Treat heat and chemical burns',
      color: '#f97316',
      urgent: false,
      steps: [
        { step: 'Remove from Source', desc: 'Get the person away from heat, fire or chemical source' },
        { step: 'Stop the Burning', desc: 'Remove burning clothing — but NOT if stuck to skin' },
        { step: 'Cool the Burn', desc: 'Run cool (not cold or ice) water over burn for 10-20 minutes' },
        { step: 'Remove Jewelry', desc: 'Remove rings, watches and tight items near the burned area' },
        { step: 'Cover the Burn', desc: 'Use clean non-fluffy material, cling film or sterile bandage' },
        { step: 'Avoid Home Remedies', desc: 'Do NOT apply butter, toothpaste, oil or ice — they make it worse' },
        { step: 'Do Not Pop Blisters', desc: 'Leave blisters intact — breaking them increases infection risk' },
        { step: 'Pain Relief', desc: 'Give paracetamol or ibuprofen for pain if available' },
        { step: 'Hydrate', desc: 'Give water to drink if person is conscious and not vomiting' },
        { step: 'Seek Help', desc: 'Call 108 for burns on face, hands, feet or large areas' },
      ],
      tips: [
        '⚠️ Chemical burns: flush with lots of water for 20+ minutes',
        '🔌 Electrical burns: do NOT touch victim — switch off power first',
        '👶 Burns in children or elderly always require hospital care',
        '📏 Burns larger than palm of hand = call 108 immediately',
      ],
      callNumber: '108',
    },
    {
      id: 'accident',
      category: 'medical',
      icon: '🚗',
      title: 'Road Accident Response',
      subtitle: 'Help accident victims safely',
      color: '#f59e0b',
      urgent: true,
      steps: [
        { step: 'Ensure Your Safety', desc: 'Check for traffic, fire or other hazards before approaching' },
        { step: 'Call Both Services', desc: 'Call 100 (Police) and 108 (Ambulance) immediately' },
        { step: 'Turn Off Engines', desc: 'Turn off car engines and switch on hazard lights' },
        { step: 'Do NOT Move Victim', desc: 'Do not move injured person — possible spinal injuries' },
        { step: 'Check Consciousness', desc: 'Tap shoulders gently and ask "Can you hear me?"' },
        { step: 'Check Breathing', desc: 'Look and listen for breathing — start CPR if not breathing' },
        { step: 'Control Bleeding', desc: 'Apply firm pressure to any visible wounds with clean cloth' },
        { step: 'Keep Head Still', desc: 'If helping, keep head and neck in line — do NOT twist or bend' },
        { step: 'Keep Victim Warm', desc: 'Cover with jacket or blanket to prevent body heat loss' },
        { step: 'Stay Until Help Comes', desc: 'Talk to victim, keep them calm and conscious until ambulance arrives' },
      ],
      tips: [
        '🚫 Never give food or water to accident victims',
        '🏍️ Remove motorcycle helmet only if victim cannot breathe',
        '📷 Note vehicle numbers for police report',
        '🚗 Move your vehicle to safe spot and use warning triangles',
      ],
      callNumber: '100',
    },
    {
      id: 'choking',
      category: 'medical',
      icon: '😮',
      title: 'Choking Response',
      subtitle: 'Clear blocked airway fast',
      color: '#10b981',
      urgent: true,
      steps: [
        { step: 'Identify Choking', desc: 'Signs: cannot speak, cough or breathe, hands at throat, blue lips' },
        { step: 'Ask if Choking', desc: 'Ask "Are you choking?" — if yes and they can cough, let them cough' },
        { step: 'Encourage Coughing', desc: 'If mild blockage, strong coughing can dislodge the object' },
        { step: 'Lean Forward', desc: 'Help them lean forward and deliver 5 firm back blows between shoulder blades' },
        { step: 'Back Blows', desc: 'Use heel of palm and give 5 sharp blows between shoulder blades' },
        { step: 'Abdominal Thrusts', desc: 'Stand behind, make fist above navel, pull sharply inward and upward' },
        { step: 'Alternate Method', desc: 'Give 5 back blows then 5 abdominal thrusts — alternate until clear' },
        { step: 'For Infants', desc: 'Face down on your forearm, give 5 gentle back blows, then 5 chest pushes' },
        { step: 'If Unconscious', desc: 'Lay them down gently and begin CPR immediately' },
        { step: 'Call 108', desc: 'Always call 108 after a choking episode even if object is removed' },
      ],
      tips: [
        '⚠️ NEVER do blind finger sweeps in the mouth',
        '🤰 For pregnant women — use chest thrusts instead of abdominal thrusts',
        '👶 Never do abdominal thrusts on infants under 1 year',
        '✅ Even after successful rescue — always see a doctor',
      ],
      callNumber: '108',
    },
    {
      id: 'selfdefense',
      category: 'women',
      icon: '🥋',
      title: 'Self-Defense Tips',
      subtitle: 'Protect yourself in danger',
      color: '#8b5cf6',
      urgent: false,
      steps: [
        { step: 'Stay Aware', desc: 'Always be aware of surroundings — avoid phone distraction in public' },
        { step: 'Trust Your Instincts', desc: 'If something feels wrong, leave the area immediately' },
        { step: 'Make Noise', desc: 'Shout FIRE loudly — people respond faster to fire than help' },
        { step: 'Press SOS Button', desc: 'Immediately press the SmartSOS button to alert contacts and police' },
        { step: 'Target Weak Points', desc: 'Eyes, nose, throat are the most vulnerable areas' },
        { step: 'Use Everyday Items', desc: 'Keys between fingers, pen, umbrella, handbag as defensive tools' },
        { step: 'Break Wrist Grabs', desc: 'Rotate arm toward attackers thumb — that is the weakest point of grip' },
        { step: 'Eye Strike', desc: 'Jab fingers toward eyes — attacker will release to protect their eyes' },
        { step: 'Run Do Not Fight', desc: 'Break free and run to nearest public place — do not stay to fight' },
        { step: 'Seek Help', desc: 'Get to a crowded area, shop or police station as fast as possible' },
      ],
      tips: [
        '📱 Always keep phone fully charged and SOS contacts set up',
        '🗣️ Tell someone your travel plans and expected arrival time',
        '👟 Wear shoes you can run in when travelling alone',
        '🔦 Carry a whistle or personal alarm on your keychain',
      ],
      callNumber: '1091',
    },
    {
      id: 'harassment',
      category: 'women',
      icon: '🚨',
      title: 'Harassment Response',
      subtitle: 'Handle unwanted situations',
      color: '#e94560',
      urgent: false,
      steps: [
        { step: 'Stay Calm', desc: 'Take a deep breath — panic makes it harder to think clearly' },
        { step: 'Use Your Voice', desc: 'Speak firmly and loudly — "Stop that" or "Back off" — draw attention' },
        { step: 'Create Distance', desc: 'Move away from the person and toward public areas or crowds' },
        { step: 'Alert Others', desc: 'Make eye contact with bystanders and ask them for help directly' },
        { step: 'Use Fake Call', desc: 'Use the SmartSOS Fake Call feature to simulate receiving a call' },
        { step: 'Record if Safe', desc: 'Record video as evidence if it is safe to do so without escalating' },
        { step: 'Enter a Safe Place', desc: 'Walk into any shop, restaurant, hotel lobby or public building' },
        { step: 'Press SOS', desc: 'Use SmartSOS panic button to alert trusted contacts immediately' },
        { step: 'Call Women Helpline', desc: 'Call 1091 — Women Helpline is available 24/7 across India' },
        { step: 'File a Complaint', desc: 'Report to police immediately — you can also file online via cybercrime portal' },
      ],
      tips: [
        '📷 Save any text messages, emails or photos as evidence',
        '👭 Travel with friends especially at night',
        '🚖 Use trusted app-based cabs and share ride details with contacts',
        '📞 Women helpline 1091 is free and confidential',
      ],
      callNumber: '1091',
    },
    {
  id: 'kidnapping',
  category: 'safety',
  icon: '🏃',
  title: 'Kidnapping Prevention',
  subtitle: 'Stay safe and escape danger',
  color: '#e94560',
  urgent: true,
  steps: [
    { step: 'Stay Alert', desc: 'Always be aware of people following you or acting suspiciously around you' },
    { step: 'Avoid Isolated Areas', desc: 'Never walk alone in dark, empty streets, parking lots or isolated areas' },
    { step: 'Trust Your Gut', desc: 'If something feels wrong immediately change direction or enter a public place' },
    { step: 'Press SOS Immediately', desc: 'Press SmartSOS panic button the moment you feel threatened' },
    { step: 'Make Noise', desc: 'Shout FIRE loudly in public — people respond faster to fire than help' },
    { step: 'If Grabbed', desc: 'Bite, scratch, kick and scream as loudly as possible to attract attention' },
    { step: 'Drop Your Weight', desc: 'Go limp and drop to the ground — dead weight is very hard to carry' },
    { step: 'Target Weak Points', desc: 'Strike eyes, nose, throat and groin — these cause maximum pain' },
    { step: 'If Put in Vehicle', desc: 'Try to kick out tail lights and wave hand through hole to signal other drivers' },
    { step: 'Stay Calm if Captured', desc: 'Stay calm, memorize surroundings, look for escape opportunities' },
  ],
  tips: [
    '📱 Always keep phone charged and SOS contacts updated',
    '🗣️ Tell someone your route and expected arrival time',
    '👥 Walk in groups especially at night',
    '🚗 Never accept rides from strangers even if they seem friendly',
  ],
  callNumber: '100',
},
{
  id: 'stalking',
  category: 'safety',
  icon: '👁️',
  title: 'Stalking Response',
  subtitle: 'Handle stalkers safely',
  color: '#8b5cf6',
  urgent: true,
  steps: [
    { step: 'Recognize Stalking', desc: 'Being repeatedly followed, watched, contacted or monitored counts as stalking' },
    { step: 'Document Everything', desc: 'Save all messages, emails, photos and note dates and times of incidents' },
    { step: 'Do Not Engage', desc: 'Never respond to stalker — even negative response encourages them' },
    { step: 'Tell Trusted People', desc: 'Inform family, friends and workplace security about the situation' },
    { step: 'Change Your Routine', desc: 'Vary your daily routes and timings so stalker cannot predict your movements' },
    { step: 'Secure Social Media', desc: 'Make all accounts private and stop sharing your location publicly' },
    { step: 'Press SOS if Followed', desc: 'If being actively followed press SmartSOS button immediately' },
    { step: 'Enter Safe Places', desc: 'Walk into police stations, hospitals or busy shops if being followed' },
    { step: 'File a Police Complaint', desc: 'Report to police with all your documented evidence — stalking is a crime' },
    { step: 'Get Legal Protection', desc: 'Apply for restraining order through court to legally keep stalker away' },
  ],
  tips: [
    '📵 Block stalker on ALL platforms including unknown numbers',
    '🏠 Do not share your home address or workplace publicly',
    '📷 Install security cameras at home entrance',
    '⚖️ Stalking is a criminal offense — you have the right to press charges',
  ],
  callNumber: '100',
},
{
  id: 'publictransport',
  category: 'safety',
  icon: '🚌',
  title: 'Public Transport Safety',
  subtitle: 'Stay safe while travelling',
  color: '#10b981',
  urgent: false,
  steps: [
    { step: 'Share Your Journey', desc: 'Always share cab number, driver details and live location before boarding' },
    { step: 'Use Trusted Apps', desc: 'Use official cab apps like Ola or Uber which have safety features built in' },
    { step: 'Sit Strategically', desc: 'In buses sit near women or near the driver — avoid last empty seats' },
    { step: 'Stay Awake', desc: 'Avoid sleeping in public transport especially in unfamiliar routes' },
    { step: 'Verify Cab Details', desc: 'Always match cab number and driver photo before getting in' },
    { step: 'Trust Your Instincts', desc: 'If driver takes wrong route immediately press SOS and call someone loudly' },
    { step: 'Pretend on Call', desc: 'Use fake call feature to pretend you are talking to someone nearby' },
    { step: 'Sit Near Exit', desc: 'In trains and buses always sit near the door for quick exit if needed' },
    { step: 'Avoid Night Travel', desc: 'Avoid travelling alone at night — if necessary inform someone of your route' },
    { step: 'Emergency in Cab', desc: 'If in danger call 100 loudly so driver knows police are being contacted' },
  ],
  tips: [
    '📸 Take photo of cab number and driver before boarding',
    '📍 Share live SmartSOS location with family while travelling',
    '🚨 Ola and Uber both have in-app SOS buttons — use them',
    '👮 Railway helpline: 182, Women helpline: 1091',
  ],
  callNumber: '1091',
},

    {
      id: 'fire',
      category: 'disaster',
      icon: '🔥',
      title: 'Fire Emergency',
      subtitle: 'Escape fire safely',
      color: '#ef4444',
      urgent: true,
      steps: [
        { step: 'Alert Everyone', desc: 'Shout FIRE loudly and activate fire alarm immediately' },
        { step: 'Call Fire Brigade', desc: 'Call 101 (Fire) immediately — do not assume someone else called' },
        { step: 'Do Not Use Elevator', desc: 'ALWAYS use stairs — never take elevator during fire' },
        { step: 'Feel Door Before Opening', desc: 'Touch door with back of hand — if hot, do NOT open it' },
        { step: 'Stay Low', desc: 'Crawl low under smoke — smoke rises and clean air is near floor' },
        { step: 'Cover Mouth and Nose', desc: 'Use wet cloth to filter smoke while escaping' },
        { step: 'Close Doors Behind You', desc: 'Closing doors slows fire spread significantly' },
        { step: 'If Trapped', desc: 'Seal door gaps with clothing, signal from window, call for help' },
        { step: 'Stop Drop Roll', desc: 'If clothes catch fire — STOP, DROP to ground, ROLL to smother flames' },
        { step: 'Do Not Re-Enter', desc: 'Once out — NEVER go back inside burning building for any reason' },
      ],
      tips: [
        '🚭 Check smoke alarms monthly and change batteries yearly',
        '🗺️ Know your building exit plan before an emergency',
        '🪣 Small kitchen fires — cover with lid and turn off heat',
        '❌ Never use water on electrical or oil fires',
      ],
      callNumber: '101',
    },
  ];

  const filteredGuides = guides.filter(g => {
    const matchCategory = activeCategory === 'all' || g.category === activeCategory;
    const matchSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>📋 Emergency Instructions</h2>
        <p style={styles.subtitle}>Life-saving guides • Works offline • Tap any card to expand</p>
      </div>

      {/* Offline badge */}
      <div style={styles.offlineBadge}>
        ✅ All guides are cached for offline use — no internet needed in emergency
      </div>

      {/* Search */}
      <div style={styles.searchWrapper}>
        <span style={styles.searchIcon}>🔍</span>
        <input
          type="text"
          placeholder="Search instructions..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} style={styles.clearBtn}>✕</button>
        )}
      </div>

      {/* Category Filter */}
      <div style={styles.categories}>
        {categories.map(c => (
          <button
            key={c.key}
            onClick={() => setActiveCategory(c.key)}
            style={{
              ...styles.catBtn,
              background: activeCategory === c.key ? c.color : 'transparent',
              borderColor: c.color,
              color: activeCategory === c.key ? '#fff' : c.color,
              boxShadow: activeCategory === c.key ? `0 4px 15px ${c.color}44` : 'none'
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p style={styles.resultsCount}>
        Showing {filteredGuides.length} guide{filteredGuides.length !== 1 ? 's' : ''}
      </p>

      {/* Guides Grid */}
      <div style={styles.guidesGrid}>
        {filteredGuides.map(guide => (
          <div key={guide.id} style={styles.guideCard}>
            {/* Card Header */}
            <div
              style={{
                ...styles.guideHeader,
                background: `linear-gradient(135deg, ${guide.color}20, ${guide.color}08)`,
                borderBottom: expandedCard === guide.id ? `1px solid ${guide.color}33` : '1px solid transparent'
              }}
              onClick={() => setExpandedCard(expandedCard === guide.id ? null : guide.id)}
            >
              <div style={styles.guideLeft}>
                <div style={{ ...styles.guideIconWrapper, background: `${guide.color}20`, border: `1px solid ${guide.color}44` }}>
                  <span style={styles.guideIcon}>{guide.icon}</span>
                </div>
                <div>
                  <div style={styles.guideTitleRow}>
                    <h3 style={styles.guideTitle}>{guide.title}</h3>
                    {guide.urgent && (
                      <span style={styles.urgentBadge}>🚨 Urgent</span>
                    )}
                  </div>
                  <p style={styles.guideSubtitle}>{guide.subtitle}</p>
                </div>
              </div>
              <button style={{ ...styles.expandBtn, color: guide.color, borderColor: `${guide.color}44` }}>
                {expandedCard === guide.id ? '▲' : '▼'}
              </button>
            </div>

            {/* Expanded Content */}
            {expandedCard === guide.id && (
              <div style={styles.guideContent}>
                {/* Steps */}
                <h4 style={styles.stepsTitle}>📌 Step-by-Step Instructions</h4>
                <div style={styles.stepsWrapper}>
                  {guide.steps.map((s, i) => (
                    <div key={i} style={styles.stepItem}>
                      <div style={{ ...styles.stepBubble, background: guide.color }}>
                        {i + 1}
                      </div>
                      <div style={styles.stepBody}>
                        <p style={styles.stepTitle}>{s.step}</p>
                        <p style={styles.stepDesc}>{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tips */}
                <div style={{ ...styles.tipsBox, borderColor: `${guide.color}44`, background: `${guide.color}10` }}>
                  <h4 style={{ ...styles.tipsTitle, color: guide.color }}>💡 Important Tips</h4>
                  {guide.tips.map((tip, i) => (
                    <p key={i} style={styles.tipItem}>{tip}</p>
                  ))}
                </div>

            {/* Call Button */}
                <a
                  href={`tel:${guide.callNumber}`}
                  style={{ 
                    ...styles.callNowBtn, 
                    background: `linear-gradient(135deg, ${guide.color}, ${guide.color}cc)` 
                  }}
                >
                  📞 Call Emergency: {guide.callNumber}
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Emergency Numbers */}
      <div style={styles.quickNumbers}>
        <h3 style={styles.qTitle}>⚡ Quick Emergency Numbers</h3>
        <div style={styles.qGrid}>
          {[
            { label: '🚓 Police', num: '100', color: '#3b82f6' },
            { label: '🚑 Ambulance', num: '108', color: '#10b981' },
            { label: '🚒 Fire Brigade', num: '101', color: '#f97316' },
            { label: '🆘 Women Helpline', num: '1091', color: '#e94560' },
            { label: '👧 Child Helpline', num: '1098', color: '#8b5cf6' },
            { label: '🏥 Medical Helpline', num: '104', color: '#f59e0b' },
          ].map((n, i) => (
            <a key={i} href={`tel:${n.num}`} style={{ ...styles.qCard, borderColor: n.color }}>
              <span style={styles.qLabel}>{n.label}</span>
              <span style={{ ...styles.qNum, color: n.color }}>{n.num}</span>
              <span style={styles.qCall}>📞 Tap to Call</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
 container: {
  minHeight: '100vh',
  padding: 'clamp(1rem, 4vw, 2rem)',
  background: '#f5f7fa',
  maxWidth: '100%',
  boxSizing: 'border-box'
},
  header: { marginBottom: '1rem' },
  title: { fontSize: '1.8rem', fontWeight: 'bold', color: '#1a1a2e' },
  subtitle: { color: '#64748b', marginTop: '6px', fontSize: '0.95rem' },
  offlineBadge: {
    display: 'inline-block', background: 'rgba(72,187,120,0.1)',
    border: '1px solid #48bb78', padding: '10px 20px', borderRadius: '50px',
    color: '#2f855a', fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: '600'
  },
  searchWrapper: {
    display: 'flex', alignItems: 'center', gap: '0.8rem',
    background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px',
    padding: '12px 16px', marginBottom: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
  searchIcon: { fontSize: '1.1rem' },
  searchInput: {
    flex: 1, background: 'transparent', border: 'none', outline: 'none',
    color: '#1a1a2e', fontSize: '1rem'
  },
  clearBtn: {
    background: 'rgba(0,0,0,0.08)', border: 'none', color: '#64748b',
    width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer',
    fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  categories: { display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '1rem' },
  catBtn: {
    padding: '10px 18px', borderRadius: '50px', border: '1px solid',
    fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer',
    transition: 'all 0.3s', whiteSpace: 'nowrap'
  },
  resultsCount: { color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' },
  guidesGrid: { display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' },
  guideCard: {
    background: '#ffffff', borderRadius: '16px',
    border: '1px solid #e2e8f0', overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'box-shadow 0.3s'
  },
  guideHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1.3rem 1.5rem', cursor: 'pointer'
  },
  guideLeft: { display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 },
  guideIconWrapper: {
    width: '52px', height: '52px', borderRadius: '14px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
  },
  guideIcon: { fontSize: '1.8rem' },
  guideTitleRow: { display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' },
  guideTitle: { fontSize: '1rem', fontWeight: 'bold', color: '#1a1a2e' },
  urgentBadge: {
    background: 'rgba(255,45,45,0.1)', border: '1px solid #ff2d2d',
    color: '#ff2d2d', padding: '2px 10px', borderRadius: '50px',
    fontSize: '0.7rem', fontWeight: 'bold'
  },
  guideSubtitle: { color: '#64748b', fontSize: '0.85rem', marginTop: '3px' },
  expandBtn: {
    background: 'transparent', border: '1px solid #e2e8f0',
    width: '32px', height: '32px', borderRadius: '8px',
    cursor: 'pointer', fontSize: '0.9rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
  },
  guideContent: { padding: '1.5rem', background: '#fafafa', borderTop: '1px solid #e2e8f0' },
  stepsTitle: { color: '#1a1a2e', fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '1.2rem' },
  stepsWrapper: { display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' },
  stepItem: { display: 'flex', gap: '1rem', alignItems: 'flex-start' },
  stepBubble: {
    width: '30px', height: '30px', borderRadius: '50%', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.8rem', fontWeight: 'bold', flexShrink: 0
  },
  stepBody: { flex: 1, paddingTop: '2px' },
  stepTitle: { color: '#1a1a2e', fontWeight: '600', fontSize: '0.9rem' },
  stepDesc: { color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6, marginTop: '2px' },
  tipsBox: {
    border: '1px solid', borderRadius: '12px',
    padding: '1.2rem', marginBottom: '1.2rem'
  },
  tipsTitle: { fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '0.8rem' },
  tipItem: { color: '#475569', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '0.4rem' },
  callNowBtn: {
    display: 'block', color: '#fff', padding: '14px',
    borderRadius: '12px', textAlign: 'center', fontSize: '1rem',
    fontWeight: 'bold', textDecoration: 'none', letterSpacing: '0.5px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.15)', border: 'none', cursor: 'pointer'
  },
  quickNumbers: { marginTop: '1rem' },
  qTitle: { fontSize: '1.2rem', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '1rem' },
  qGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' },
  qCard: {
    background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px',
    padding: '1.2rem', display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '6px', textDecoration: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'transform 0.2s'
  },
  qLabel: { color: '#64748b', fontSize: '0.82rem', textAlign: 'center' },
  qNum: { fontSize: '1.5rem', fontWeight: 'bold' },
  qCall: { color: '#94a3b8', fontSize: '0.75rem' },
};

export default Instructions;