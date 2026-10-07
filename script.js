const STORE = {
  profile: "comradesoko.profile",
  products: "comradesoko.products",
  reviews: "comradesoko.reviews",
  posts: "comradesoko.posts",
  saves: "comradesoko.saves",
  orders: "comradesoko.orders",
  escrows: "comradesoko.escrows",
  comments: "comradesoko.comments",
  conversations: "comradesoko.conversations"
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const searchForm = $("#search-form");
const searchInput = $("#search-input");
const campusFilter = $("#campus-filter");
const areaFilter = $("#area-filter");
const listingGrid = $("#listing-grid");
const listingCount = $("#listing-count");
const resultsLabel = $("#results-label");
const emptyState = $("#empty-state");
const institutionStatus = $("#institution-status");
const connectionsSection = $("#connections");
const connectionsGrid = $("#connections-grid");
const roomGrid = $("#room-grid");
const roomCount = $("#room-count");
const roomBudget = $("#room-budget");
const roomEmpty = $("#room-empty");
const housingStatus = $("#housing-status");
const accountDialog = $("#account-dialog");
const sellerDialog = $("#seller-dialog");
const reviewDialog = $("#review-dialog");
const productDialog = $("#product-dialog");
const toast = $("#toast");

let activeCategory = "";
let activeSeller = null;
let activeConversationId = "";
let toastTimer;
const sampleRooms = [
  { institution: "kisii university", title: "Single room, water included", area: "Manyatta", rent: 4500, deposit: 4500, features: ["Water included", "Secure gate", "Walking distance"], available: "Vacant now", contact: "Comrade Homes" },
  { institution: "kisii university", title: "Bedsitter near main gate", area: "Behind Main Gate", rent: 8500, deposit: 8500, features: ["Private bathroom", "Water tank", "Quiet compound"], available: "Vacant now", contact: "Kisii Campus Rooms" },
  { institution: "egerton university", title: "Affordable single room", area: "Town", rent: 4000, deposit: 4000, features: ["Water nearby", "Secure compound", "Shared kitchen"], available: "Vacant now", contact: "Njoro Student Homes" },
  { institution: "maseno university", title: "Furnished student bedsitter", area: "Manyatta", rent: 9000, deposit: 9000, features: ["Furnished", "Private bathroom", "Wi-Fi ready"], available: "Vacant now", contact: "Maseno Rooms Board" },
  { institution: "masinde muliro university", title: "Single room by campus", area: "Main Gate", rent: 5000, deposit: 5000, features: ["Secure gate", "Water included", "Near matatu stop"], available: "Vacant now", contact: "Kakamega Campus Lets" },
  { institution: "great lakes university of kisumu", title: "Student room in a quiet compound", area: "Manyatta", rent: 6000, deposit: 6000, features: ["Secure compound", "Water nearby", "Shared kitchen"], available: "Vacant now", contact: "Kisumu Student Homes" }
];

const institutionLabels = new Map();

const campusConnections = [
  ["kisii university", "Brian O.", "Main Gate", "Web development", "Building websites and keen to meet other student founders.", "tone-blue"],
  ["kisii university", "Akinyi M.", "Jogoo", "Small business", "Growing a fresh-produce hustle and sharing tips with new sellers.", "tone-peach"],
  ["egerton university", "Kevin K.", "Town", "Barbering & style", "A campus barber connecting with creatives and local businesses.", "tone-blue"],
  ["egerton university", "Nia W.", "Main Gate", "Food & baking", "Baking treats for campus events and looking for collaborators.", "tone-peach"],
  ["maseno university", "Brian O.", "Main Gate", "Web development", "Building websites and keen to meet other student founders.", "tone-blue"],
  ["maseno university", "Faith A.", "Manyatta", "Design & branding", "Helping campus hustles find their look and reach more people.", "tone-lilac"],
  ["masinde muliro university", "Auma C.", "Main Gate", "Design & branding", "Creating brand kits and posters for new campus businesses.", "tone-lilac"],
  ["masinde muliro university", "Eli M.", "Manyatta", "Photography", "Photographing campus events and connecting with local makers.", "tone-blue"],
  ["great lakes university of kisumu", "Zawadi M.", "Manyatta", "Food & baking", "Making snack boxes for study groups and campus meetups.", "tone-peach"],
  ["great lakes university of kisumu", "Chris O.", "Main Gate", "Photography", "Photographing events and collaborating with student businesses.", "tone-blue"]
].map(([institution, name, area, interest, bio, tone]) => ({ institution, name, area, interest, bio, tone }));

const sampleHubPosts = [
  { id: "sample-kisii-dev", institution: "kisii university", name: "Brian O.", area: "Main Gate", kind: "Offering a skill", content: "I build clean websites for student businesses. Let’s get your hustle online.", time: "Campus spotlight" },
  { id: "sample-kisii-idea", institution: "kisii university", name: "Akinyi M.", area: "Jogoo", kind: "Looking to collaborate", content: "Looking for a designer to help make my fresh-produce brand stand out.", time: "Campus spotlight" },
  { id: "sample-egerton-idea", institution: "egerton university", name: "Nia W.", area: "Main Gate", kind: "Sharing an idea", content: "Planning a campus bake sale—who wants to collaborate on promotion?", time: "Campus spotlight" },
  { id: "sample-maseno-dev", institution: "maseno university", name: "Faith A.", area: "Manyatta", kind: "Offering a skill", content: "I make logos and posters for campus businesses at student-friendly rates.", time: "Campus spotlight" },
  { id: "sample-mm-idea", institution: "masinde muliro university", name: "Auma C.", area: "Main Gate", kind: "Looking to collaborate", content: "Looking for a photographer to collaborate on a small campus clothing shoot.", time: "Campus spotlight" },
  { id: "sample-kisumu-dev", institution: "great lakes university of kisumu", name: "Chris O.", area: "Main Gate", kind: "Offering a skill", content: "Available for event photography and quick portraits around campus.", time: "Campus spotlight" }
];

function readStore(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch (error) {
    console.error(`Could not read ComradeSoko browser data (${key}).`, error);
    showToast("Some saved prototype data could not be read. Clear site data to reset the demo.");
    return fallback;
  }
}

function writeStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Could not save ComradeSoko browser data (${key}).`, error);
    showToast("Could not save. Your browser storage may be full; try fewer or smaller photos.");
    return false;
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 3800);
}

function idFor(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getProfile() {
  return readStore(STORE.profile, null);
}

function getProducts() {
  return readStore(STORE.products, []);
}

function getReviews() {
  return readStore(STORE.reviews, []);
}

function getConversations() {
  return readStore(STORE.conversations, []);
}

function conversationIdFor(firstId, secondId) {
  return [firstId, secondId].sort().join("::");
}

function openConversation(contact, firstMessage = "") {
  const profile = getProfile();
  if (!profile) {
    showToast("Create a local profile to send an inbox message.");
    accountDialog.showModal();
    return;
  }
  if (!contact.id || contact.id === profile.id) {
    showToast("You can only message another campus member.");
    return;
  }
  if (contact.institution !== profile.institution) {
    showToast("Inbox messages are limited to your profile institution.");
    return;
  }
  const id = conversationIdFor(profile.id, contact.id);
  const conversations = getConversations();
  let conversation = conversations.find((item) => item.id === id);
  if (!conversation) {
    conversation = {
      id,
      institution: profile.institution,
      participants: [
        { id: profile.id, name: profile.name },
        { id: contact.id, name: contact.name }
      ],
      messages: []
    };
    conversations.push(conversation);
  }
  activeConversationId = id;
  if (!writeStore(STORE.conversations, conversations)) return;
  renderInbox();
  const composer = $("#inbox-thread textarea[name='message']");
  if (firstMessage && conversation.messages.length === 0 && composer) {
    composer.value = firstMessage;
    composer.focus();
  }
  $("#inbox").scrollIntoView({ behavior: "smooth", block: "start" });
}

function shareHubPost(post) {
  const url = new URL(window.location.href);
  url.hash = "developers-hub";
  const shareData = { title: `ComradeSoko: ${post.kind}`, text: `${post.name}: ${post.content}`, url: url.href };
  if (navigator.share) {
    navigator.share(shareData).catch((error) => {
      if (error.name !== "AbortError") showToast("Could not open the share menu. Try copying the post link.");
    });
    return;
  }
  if (!navigator.clipboard?.writeText) {
    showToast("Sharing is not available in this browser.");
    return;
  }
  navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`)
    .then(() => showToast("Post text and link copied."))
    .catch((error) => {
      console.error("Could not copy campus post share link.", error);
      showToast("Could not copy the post. Check browser clipboard permissions.");
    });
}

function getOrders() {
  return readStore(STORE.orders, []);
}

function renderEscrowDashboard(dashboard, profile) {
  const section = document.createElement("section");
  section.className = "escrow-dashboard";
  section.setAttribute("aria-labelledby", "escrow-dashboard-title");

  const heading = document.createElement("div");
  heading.className = "dashboard-subheading";
  const title = document.createElement("h3");
  title.id = "escrow-dashboard-title";
  title.textContent = "Escrow transaction preview";
  const badge = document.createElement("span");
  badge.className = "escrow-demo-badge";
  badge.textContent = "SIMULATION ONLY";
  heading.append(title, badge);

  const disclosure = document.createElement("p");
  disclosure.className = "escrow-disclosure";
  disclosure.textContent = "No money is collected, held, or released by this website. This local demo does not protect a real transaction. Do not send money to ComradeSoko based on this preview.";
  const termsLink = document.createElement("a");
  termsLink.href = "#escrow-terms";
  termsLink.textContent = "Read the proposed escrow terms";
  termsLink.addEventListener("click", () => {
    const terms = $("#escrow-terms");
    if (terms) terms.open = true;
  });
  disclosure.append(" ", termsLink);

  const form = document.createElement("form");
  form.className = "escrow-create-form";
  form.setAttribute("aria-label", "Create a simulated escrow transaction");
  const itemLabel = document.createElement("label");
  itemLabel.textContent = "Item or service";
  const itemInput = document.createElement("input");
  itemInput.name = "item";
  itemInput.maxLength = 80;
  itemInput.placeholder = "e.g. 13kg gas refill";
  itemInput.required = true;
  itemLabel.append(itemInput);
  const sellerLabel = document.createElement("label");
  sellerLabel.textContent = "Seller or provider";
  const sellerInput = document.createElement("input");
  sellerInput.name = "seller";
  sellerInput.maxLength = 60;
  sellerInput.placeholder = "Seller or business name";
  sellerInput.required = true;
  sellerLabel.append(sellerInput);
  const amountLabel = document.createElement("label");
  amountLabel.textContent = "Agreed amount (KES)";
  const amountInput = document.createElement("input");
  amountInput.name = "amount";
  amountInput.type = "number";
  amountInput.min = "1";
  amountInput.max = "10000000";
  amountInput.step = "1";
  amountInput.inputMode = "numeric";
  amountInput.placeholder = "e.g. 3200";
  amountInput.required = true;
  amountLabel.append(amountInput);
  const create = document.createElement("button");
  create.type = "submit";
  create.className = "button button-dark compact-button";
  create.textContent = "Create demo record";
  form.append(itemLabel, sellerLabel, amountLabel, create);

  const records = document.createElement("div");
  records.className = "escrow-records";
  const escrows = readStore(STORE.escrows, []).filter((escrow) => escrow.createdBy === profile.id);
  if (!escrows.length) {
    const empty = document.createElement("p");
    empty.className = "form-hint";
    empty.textContent = "No demo escrow records yet. Create one to preview the two-sided delivery confirmation flow.";
    records.append(empty);
  }
  for (const escrow of escrows.slice().reverse()) {
    const card = document.createElement("article");
    card.className = "escrow-record";
    const recordHeading = document.createElement("div");
    recordHeading.className = "escrow-record-heading";
    const item = document.createElement("strong");
    item.textContent = escrow.item;
    const amount = document.createElement("span");
    amount.textContent = `KES ${Number(escrow.amount).toLocaleString("en-KE")}`;
    recordHeading.append(item, amount);
    const details = document.createElement("p");
    details.textContent = `Buyer: ${escrow.buyerName} · Seller: ${escrow.sellerName}`;
    const status = document.createElement("p");
    status.className = `escrow-record-status${escrow.adminReleased ? " released" : ""}`;
    status.textContent = escrow.adminReleased
      ? "Demo release recorded — no funds moved."
      : escrow.buyerConfirmed && escrow.sellerConfirmed
        ? "Both demo confirmations received — ready for simulated admin review."
        : `Waiting for confirmations · Buyer: ${escrow.buyerConfirmed ? "confirmed" : "pending"} · Seller: ${escrow.sellerConfirmed ? "confirmed" : "pending"}`;
    const actions = document.createElement("div");
    actions.className = "escrow-record-actions";
    if (!escrow.buyerConfirmed && !escrow.adminReleased) {
      const buyerConfirm = document.createElement("button");
      buyerConfirm.type = "button";
      buyerConfirm.className = "text-button";
      buyerConfirm.dataset.action = "escrow-confirm-buyer";
      buyerConfirm.dataset.escrowId = escrow.id;
      buyerConfirm.textContent = "Simulate buyer received";
      actions.append(buyerConfirm);
    }
    if (!escrow.sellerConfirmed && !escrow.adminReleased) {
      const sellerConfirm = document.createElement("button");
      sellerConfirm.type = "button";
      sellerConfirm.className = "text-button";
      sellerConfirm.dataset.action = "escrow-confirm-seller";
      sellerConfirm.dataset.escrowId = escrow.id;
      sellerConfirm.textContent = "Simulate seller delivered";
      actions.append(sellerConfirm);
    }
    if (escrow.buyerConfirmed && escrow.sellerConfirmed && !escrow.adminReleased) {
      const release = document.createElement("button");
      release.type = "button";
      release.className = "text-button escrow-release-button";
      release.dataset.action = "escrow-demo-release";
      release.dataset.escrowId = escrow.id;
      release.textContent = "Simulate admin release";
      actions.append(release);
    }
    card.append(recordHeading, details, status, actions);
    records.append(card);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const itemName = itemInput.value.trim();
    const sellerName = sellerInput.value.trim();
    const agreedAmount = Number(amountInput.value);
    if (!itemName || !sellerName || !Number.isSafeInteger(agreedAmount) || agreedAmount < 1 || agreedAmount > 10000000) {
      showToast("Enter an item, seller name, and a whole-number amount between KES 1 and KES 10,000,000.");
      return;
    }
    const next = readStore(STORE.escrows, []);
    next.push({
      id: idFor("escrow-demo"),
      createdBy: profile.id,
      buyerName: profile.name,
      sellerName,
      item: itemName,
      amount: agreedAmount,
      buyerConfirmed: false,
      sellerConfirmed: false,
      adminReleased: false,
      createdAt: new Date().toISOString()
    });
    if (writeStore(STORE.escrows, next)) {
      renderDashboard();
      showToast("Local demo record created. No payment was collected.");
    }
  });

  section.append(heading, disclosure, form, records);
  dashboard.append(section);
}

function getSaves() {
  return readStore(STORE.saves, []);
}

function populateInstitutionSelectors() {
  const selectors = [campusFilter, $("#profile-campus")];
  const curatedGroups = window.COMRADESOKO_INSTITUTIONS || [];
  const tvetRecords = window.COMRADESOKO_TVET_INSTITUTIONS || [];

  for (const selector of selectors) {
    const placeholder = selector.options[0];
    selector.replaceChildren(placeholder);
    const seenValues = new Set();
    const curatedNames = new Set();
    for (const group of curatedGroups) {
      const optgroup = document.createElement("optgroup");
      optgroup.label = group.group;
      for (const [name, value] of group.items) {
        const normalizedName = name.toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
        curatedNames.add(normalizedName);
        addInstitutionOption(optgroup, name, value, seenValues);
      }
      selector.append(optgroup);
    }

    const tvetGroupLabels = [
      ["NP", "Registered National Polytechnics"],
      ["TVC", "Registered Technical and Vocational Colleges"],
      ["VTC", "Registered Vocational Training Centres"]
    ];
    for (const [type, label] of tvetGroupLabels) {
      const records = tvetRecords.filter((record) => record.type === type);
      if (!records.length) continue;
      const optgroup = document.createElement("optgroup");
      optgroup.label = label;
      records.forEach((record) => {
        const normalizedName = record.name.toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
        if (curatedNames.has(normalizedName)) return;
        const name = `${record.name} — ${record.county} County`;
        addInstitutionOption(optgroup, name, record.value, seenValues);
      });
      selector.append(optgroup);
    }

    const other = document.createElement("optgroup");
    other.label = "Find or request an institution";
    const request = new Option("My institution isn't listed — request it", "request-institution");
    seenValues.add(request.value);
    other.append(request);
    selector.append(other);
  }
}

function addInstitutionOption(group, name, value, seenValues) {
  if (seenValues.has(value)) return;
  seenValues.add(value);
  institutionLabels.set(value, name);
  group.append(new Option(name, value));
}

function institutionName(value) {
  return institutionLabels.get(value) || value;
}

function roleName(role) {
  return {
    buyer: "Buyer / comrade",
    seller: "Student seller",
    developer: "Developer / creative",
    "local-provider": "Local campus partner"
  }[role] || "Comrade";
}

function isSellerRole(role) {
  return role === "seller" || role === "local-provider";
}

function accountButtonLabel(profile) {
  const shortRole = { buyer: "Buyer", seller: "Seller", developer: "Creative", "local-provider": "Partner" }[profile.role] || "Account";
  return `${profile.name.split(" ")[0]} · ${shortRole}`;
}

function updateProfileRoleFields() {
  const role = $("#profile-role").value;
  const needsShop = isSellerRole(role);
  $("#shop-name-field").hidden = !needsShop;
  $("#profile-shop-name").required = needsShop;
  $("#profile-area-label").textContent = role === "local-provider" ? "Area where your business serves students" : "Campus area";
  $("#profile-area").placeholder = role === "local-provider" ? "e.g. Near Main Gate, Manyatta" : "e.g. Manyatta, Main Gate";
  const providerAgreement = role === "local-provider";
  $("#provider-agreement-field").hidden = !providerAgreement;
  $("#provider-agreement-check").required = providerAgreement;
}

function allListingElements() {
  return $$(".listing-card", listingGrid);
}

function updateAreaOptions() {
  const campus = campusFilter.value;
  const currentArea = areaFilter.value;
  const availableAreas = [...new Set([
    ...allListingElements()
      .filter((card) => card.dataset.campus === campus)
      .map((card) => card.dataset.area),
    ...sampleRooms.filter((room) => room.institution === campus).map((room) => room.area.toLowerCase())
  ])].sort();

  areaFilter.replaceChildren(new Option("Any campus area", ""));
  for (const area of availableAreas) {
    areaFilter.add(new Option(area.replace(/\b\w/g, (letter) => letter.toUpperCase()), area));
  }
  areaFilter.value = availableAreas.includes(currentArea) ? currentArea : "";
}

function makeRoomCard(room) {
  const card = document.createElement("article");
  card.className = "room-card";
  card.dataset.id = room.id || `sample-room-${room.institution.replace(/[^a-z0-9]+/g, "-")}-${room.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  card.dataset.institution = room.institution;
  card.dataset.area = room.area.toLowerCase();
  card.dataset.rent = String(room.rent);
  card.dataset.search = `${room.title} ${room.area} ${room.features.join(" ")} ${room.contact}`.toLowerCase();

  const photo = document.createElement("div");
  photo.className = "room-image";
  const symbol = document.createElement("span");
  symbol.className = "room-symbol";
  symbol.setAttribute("aria-hidden", "true");
  symbol.textContent = "⌂";
  const sampleBadge = document.createElement("span");
  sampleBadge.className = "image-badge";
  sampleBadge.textContent = "SAMPLE ROOM";
  const availability = document.createElement("span");
  availability.className = "room-availability";
  availability.innerHTML = '<i></i> Vacant now';
  photo.append(symbol, sampleBadge, availability);

  const body = document.createElement("div");
  body.className = "room-details";
  const top = document.createElement("div");
  top.className = "room-card-heading";
  const title = document.createElement("h3");
  title.textContent = room.title;
  const rent = document.createElement("strong");
  rent.textContent = `KSh ${room.rent.toLocaleString("en-KE")}<small> / month</small>`;
  top.append(title, rent);
  const place = document.createElement("p");
  place.className = "room-location";
  place.textContent = `⌖ ${room.area} · ${institutionName(room.institution)}`;
  const features = document.createElement("ul");
  features.className = "room-features";
  for (const feature of room.features) {
    const item = document.createElement("li");
    item.textContent = feature;
    features.append(item);
  }
  const terms = document.createElement("p");
  terms.className = "room-terms";
  terms.textContent = `Deposit: KSh ${room.deposit.toLocaleString("en-KE")} · ${room.available}`;
  const mapLink = document.createElement("a");
  mapLink.className = "room-map-link";
  mapLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${room.area}, ${institutionName(room.institution)}, Kenya`)}`;
  mapLink.target = "_blank";
  mapLink.rel = "noopener noreferrer";
  mapLink.textContent = `⌖ View ${room.area} on Google Maps`;
  const inquire = document.createElement("a");
  inquire.className = "whatsapp-button room-inquire";
  inquire.href = `https://wa.me/?text=${encodeURIComponent(`Hi, I saw your vacant room listing on ComradeSoko: ${room.title}, ${room.area}, near ${institutionName(room.institution)}. Is it still available, and can I arrange a viewing?`)}`;
  inquire.target = "_blank";
  inquire.rel = "noopener noreferrer";
  inquire.textContent = "☏  Ask about this room on WhatsApp";
  const discussion = document.createElement("section");
  discussion.className = "room-discussion";
  discussion.id = `discussion-${card.dataset.id}`;
  discussion.append(makeDiscussion(card.dataset.id, "room"));
  const discussionToggle = document.createElement("button");
  discussionToggle.type = "button";
  discussionToggle.className = "room-discussion-toggle";
  discussionToggle.dataset.action = "toggle-room-discussion";
  discussionToggle.setAttribute("aria-controls", discussion.id);
  discussionToggle.setAttribute("aria-expanded", "false");
  const commentCount = discussionCommentsFor(card.dataset.id, "room").length;
  discussionToggle.textContent = `Questions & comments${commentCount ? ` (${commentCount})` : ""}`;
  discussion.hidden = true;
  body.append(top, place, mapLink, features, terms, inquire, discussionToggle, discussion);
  card.append(photo, body);
  return card;
}

function renderRooms() {
  roomGrid.replaceChildren(...sampleRooms.map(makeRoomCard));
  updateRooms();
}

function updateRooms() {
  const institution = campusFilter.value;
  const query = searchInput.value.trim().toLowerCase();
  const area = areaFilter.value;
  const budget = roomBudget.value ? Number(roomBudget.value) : Infinity;
  const cards = $$(".room-card", roomGrid);
  let count = 0;

  roomBudget.disabled = !institution;
  roomGrid.hidden = !institution;
  if (!institution) {
    roomCount.textContent = "00 ROOMS";
    housingStatus.textContent = "Choose your institution above to see vacant rooms near campus.";
    roomEmpty.hidden = false;
    $("#room-empty-title").textContent = "Choose your institution to start house hunting";
    $("#room-empty-description").textContent = "Room listings only appear for the campus you select.";
    return;
  }

  housingStatus.textContent = `Showing room listings for ${institutionName(institution)} only. Confirm availability directly with the contact.`;
  for (const card of cards) {
    const visible = card.dataset.institution === institution
      && (!query || card.dataset.search.includes(query))
      && (!area || card.dataset.area === area)
      && Number(card.dataset.rent) <= budget;
    card.hidden = !visible;
    if (visible) count += 1;
  }
  roomCount.textContent = `${String(count).padStart(2, "0")} ${count === 1 ? "ROOM" : "ROOMS"}`;
  roomEmpty.hidden = count !== 0;
  $("#room-empty-title").textContent = "No rooms match those filters";
  $("#room-empty-description").textContent = "Try a different area or budget, or check back for new vacant rooms.";
}

function makeConnectionCard(profile) {
  const card = document.createElement("article");
  card.className = "connection-card";
  const top = document.createElement("div");
  top.className = "connection-top";
  const avatar = document.createElement("span");
  avatar.className = `connection-avatar ${profile.tone}`;
  avatar.textContent = profile.name.charAt(0);
  const identity = document.createElement("div");
  const name = document.createElement("p");
  name.className = "connection-name";
  name.textContent = profile.name;
  const location = document.createElement("p");
  location.className = "connection-location";
  location.textContent = `⌖ ${profile.area} · ${institutionName(profile.institution)}`;
  identity.append(name, location);
  top.append(avatar, identity);

  const interest = document.createElement("span");
  interest.className = "connection-tag";
  interest.textContent = profile.interest;
  const bio = document.createElement("p");
  bio.className = "connection-bio";
  bio.textContent = profile.bio;
  const contact = document.createElement("a");
  contact.className = "connection-action";
  const message = `Hi ${profile.name}, ComradeSoko recommended we connect since we're both at ${institutionName(profile.institution)}. I saw your ${profile.interest.toLowerCase()} interests and wanted to say hi!`;
  contact.href = `https://wa.me/?text=${encodeURIComponent(message)}`;
  contact.target = "_blank";
  contact.rel = "noopener noreferrer";
  contact.textContent = "Start a WhatsApp intro";
  const inboxContact = document.createElement("button");
  inboxContact.type = "button";
  inboxContact.className = "connection-action connection-inbox-action";
  inboxContact.dataset.contactId = `connection:${profile.institution}:${profile.name}`;
  inboxContact.dataset.contactName = profile.name;
  inboxContact.dataset.institution = profile.institution;
  inboxContact.textContent = "Message in ComradeSoko";
  card.append(top, interest, bio, inboxContact, contact);
  return card;
}

function renderConnections(institution) {
  const recommendations = campusConnections.filter((person) => person.institution === institution);
  connectionsGrid.replaceChildren(...recommendations.map(makeConnectionCard));
  connectionsSection.hidden = recommendations.length === 0;
}

connectionsGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".connection-inbox-action");
  if (!button) return;
  openConversation({
    id: button.dataset.contactId,
    name: button.dataset.contactName,
    institution: button.dataset.institution
  });
});

function phoneForWhatsApp(value) {
  const digits = (value || "").replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 10) return `254${digits.slice(1)}`;
  if (digits.startsWith("254") && digits.length === 12) return digits;
  if (digits.startsWith("7") && digits.length === 9) return `254${digits}`;
  return "";
}

function ratingForSeller(seller, fallbackText) {
  const reviews = getReviews().filter((review) => review.seller === seller);
  if (!reviews.length) return fallbackText || "New seller";
  const average = reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length;
  return `★ ${average.toFixed(1)} (${reviews.length})`;
}

function applyCardRating(card) {
  const seller = card.dataset.seller;
  const rating = $(".rating", card);
  if (rating) {
    const initial = card.dataset.initialRating || rating.textContent.trim();
    card.dataset.initialRating = initial;
    rating.textContent = ratingForSeller(seller, initial);
  }
}

function addCardControls(card) {
  const actions = $(".listing-actions", card);
  if (!card.dataset.id) {
    const stablePart = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    card.dataset.id = `sample-${stablePart(card.dataset.campus)}-${stablePart(card.dataset.seller)}-${stablePart(card.dataset.product)}`;
  }
  if (!actions) {
    const container = document.createElement("div");
    container.className = "listing-actions";
    const sellerButton = document.createElement("button");
    sellerButton.type = "button";
    sellerButton.className = "seller-profile-button";
    sellerButton.dataset.action = "view-seller";
    sellerButton.textContent = "Seller profile";
    const messageButton = document.createElement("button");
    messageButton.type = "button";
    messageButton.className = "message-seller-button";
    messageButton.dataset.action = "message-seller";
    messageButton.textContent = "Message";
    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.className = "save-button";
    saveButton.dataset.action = "save-seller";
    saveButton.setAttribute("aria-label", "Save seller");
    const discussionButton = document.createElement("button");
    discussionButton.type = "button";
    discussionButton.className = "discussion-toggle";
    discussionButton.dataset.action = "toggle-discussion";
    container.append(sellerButton, messageButton, saveButton, discussionButton);
    $(".listing-details", card).append(container);
  }

  let discussion = $(".listing-discussion", card);
  if (!discussion) {
    discussion = document.createElement("section");
    discussion.className = "listing-discussion";
    discussion.id = `discussion-${card.dataset.id}`;
    discussion.hidden = true;
    $(".listing-details", card).append(discussion);
  }
  discussion.replaceChildren(makeDiscussion(card.dataset.id, "listing"));
  const discussionButton = $('[data-action="toggle-discussion"]', card);
  const discussionCount = discussionCommentsFor(card.dataset.id, "listing").length;
  discussionButton.textContent = `Discuss${discussionCount ? ` (${discussionCount})` : ""}`;
  discussionButton.setAttribute("aria-expanded", String(!discussion.hidden));
  discussionButton.setAttribute("aria-controls", discussion.id);
  discussionButton.setAttribute("aria-label", `Discuss ${card.dataset.product}`);

  const saved = getSaves().includes(card.dataset.seller);
  const saveButton = $('[data-action="save-seller"]', card);
  saveButton.textContent = saved ? "♥ Saved" : "♡ Save";
  saveButton.setAttribute("aria-pressed", String(saved));
  applyCardRating(card);
}

function makeProductCard(product) {
  const card = document.createElement("article");
  card.className = "listing-card user-listing";
  card.dataset.id = product.id;
  card.dataset.category = product.category;
  card.dataset.search = `${product.name} ${product.seller} ${product.category} ${product.area} ${product.institution}`.toLowerCase();
  card.dataset.campus = product.institution;
  card.dataset.area = product.area.toLowerCase();
  card.dataset.seller = product.seller;
  card.dataset.product = product.name;
  card.dataset.ownerId = product.ownerId || "";
  card.dataset.phone = product.phone || "";
  card.dataset.owner = product.owner || "";
  card.dataset.stock = String(product.stock);
  card.dataset.soldOut = String(product.soldOut === true);
  card.dataset.deliveryFee = String(product.deliveryFee || 0);
  card.dataset.deliveryTime = String(product.deliveryTime || "");
  card.dataset.photos = JSON.stringify(product.photos || []);

  const image = document.createElement("div");
  image.className = `listing-image image-${product.category}`;
  const badge = document.createElement("span");
  badge.className = `image-badge${product.soldOut ? " sold-out-badge" : ""}`;
  badge.textContent = product.soldOut ? "SOLD OUT" : "LOCAL LISTING";
  if (product.photos && product.photos[0]) {
    image.style.backgroundImage = `url("${product.photos[0]}")`;
    image.classList.add("listing-photo");
  } else {
    const icon = document.createElement("span");
    icon.className = "listing-emoji";
    icon.textContent = categoryIcon(product.category);
    image.append(icon);
  }
  image.prepend(badge);

  const details = document.createElement("div");
  details.className = "listing-details";
  const sellerLine = document.createElement("div");
  sellerLine.className = "seller-line";
  const avatar = document.createElement("span");
  avatar.className = "seller-avatar avatar-green";
  avatar.textContent = product.seller.charAt(0).toUpperCase();
  const sellerName = document.createElement("span");
  sellerName.textContent = product.seller;
  const localBadge = document.createElement("span");
  localBadge.className = "demo-badge";
  localBadge.textContent = "LOCAL";
  sellerLine.append(avatar, sellerName, localBadge);
  const title = document.createElement("h4");
  title.textContent = product.name;
  const meta = document.createElement("div");
  meta.className = "listing-meta";
  const location = document.createElement("span");
  location.textContent = `⌖ ${product.area}`;
  const category = document.createElement("span");
  category.textContent = categoryName(product.category);
  meta.append(location, category);
  const bottom = document.createElement("div");
  bottom.className = "listing-bottom";
  const price = document.createElement("strong");
  price.textContent = `KSh ${Number(product.price).toLocaleString("en-KE")}`;
  const rating = document.createElement("span");
  rating.className = "rating";
  rating.textContent = "New seller";
  bottom.append(price, rating);

  const order = document.createElement("a");
  order.className = `whatsapp-button${product.soldOut ? " disabled-order" : ""}`;
  order.dataset.whatsapp = "";
  order.target = "_blank";
  order.rel = "noopener noreferrer";
  const deliveryText = ["gas", "water"].includes(product.category)
    ? ` Delivery fee KSh ${Number(product.deliveryFee || 0).toLocaleString("en-KE")}; estimated ${product.deliveryTime || 30} minutes.`
    : "";
  const message = `Hi, I saw your ${product.name} on ComradeSoko at ${product.area}. Is it available?${deliveryText}`;
  order.href = product.soldOut ? "#" : `https://wa.me/${phoneForWhatsApp(product.phone)}?text=${encodeURIComponent(message)}`;
  const whatsappIcon = document.createElement("span");
  whatsappIcon.textContent = "☏";
  order.append(whatsappIcon, document.createTextNode(product.soldOut ? "Currently sold out" : "Order on WhatsApp"));
  details.append(sellerLine, title, meta, bottom, order);
  if (product.menu) {
    const menu = document.createElement("p");
    menu.className = "product-menu";
    menu.textContent = `Today: ${product.menu}`;
    details.append(menu);
  }
  if (["gas", "water"].includes(product.category)) {
    const delivery = document.createElement("p");
    delivery.className = "product-menu";
    delivery.textContent = `${product.stock} in stock · ${product.deliveryTime || 30} min delivery`;
    details.append(delivery);
  }
  card.append(image, details);
  return card;
}

function categoryIcon(category) {
  return { gas: "🔥", water: "💧", groceries: "🍎", food: "🍛", clothes: "👕", beauty: "💈", tech: "💻", services: "🧺" }[category] || "✳";
}

function categoryName(category) {
  return { gas: "Gas delivery", water: "Water delivery", groceries: "Fruits & groceries", food: "Food & cake", clothes: "Clothes & shoes", beauty: "Barber & hair", tech: "Developers & techies", services: "Other services" }[category] || "Other services";
}

function renderProducts() {
  $$(".user-listing", listingGrid).forEach((card) => card.remove());
  for (const product of getProducts()) listingGrid.append(makeProductCard(product));
  for (const card of allListingElements()) addCardControls(card);
}

function updateListings() {
  const institution = campusFilter.value;
  const query = searchInput.value.trim().toLowerCase();
  const area = areaFilter.value;
  const cards = allListingElements();
  const hasInstitution = institution !== "";
  let visibleCount = 0;

  listingGrid.hidden = !hasInstitution;
  searchInput.disabled = !hasInstitution;
  areaFilter.disabled = !hasInstitution;
  $(".search-button", searchForm).disabled = !hasInstitution;

  if (!hasInstitution) {
    cards.forEach((card) => { card.hidden = true; });
    emptyState.hidden = false;
    $("#empty-title").textContent = "Choose your institution to get started";
    $("#empty-description").textContent = "Your soko is local. Select a campus above and discover what’s around you.";
    listingCount.textContent = "00 SELLERS";
    resultsLabel.textContent = "Choose your institution to see local sellers";
    connectionsSection.hidden = true;
    institutionStatus.textContent = "Choose your institution to unlock your local soko.";
    institutionStatus.classList.remove("selected");
    updateRooms();
    return;
  }

  institutionStatus.textContent = `Showing sellers and connection recommendations for ${institutionName(institution)}.`;
  institutionStatus.classList.add("selected");
  for (const card of cards) {
    const searchText = `${card.dataset.search} ${card.dataset.seller} ${card.dataset.product}`.toLowerCase();
    const sellerReviews = getReviews().filter((review) => review.seller === card.dataset.seller);
    const averageRating = sellerReviews.length
      ? sellerReviews.reduce((sum, review) => sum + Number(review.rating), 0) / sellerReviews.length
      : 5;
    const meetsTrustThreshold = sellerReviews.length < 3 || averageRating >= 2.5;
    const visible = card.dataset.campus === institution
      && (!activeCategory || card.dataset.category === activeCategory)
      && (!query || searchText.includes(query))
      && (!area || card.dataset.area === area)
      && meetsTrustThreshold;
    card.hidden = !visible;
    if (visible) visibleCount += 1;
  }

  emptyState.hidden = visibleCount !== 0;
  $("#empty-title").textContent = "No sellers match just yet";
  $("#empty-description").textContent = "Try another search or area, or check back as more campus hustles join. Repeated low-rated sellers are hidden.";
  listingCount.textContent = `${String(visibleCount).padStart(2, "0")} ${visibleCount === 1 ? "SELLER" : "SELLERS"}`;
  resultsLabel.textContent = query || area || activeCategory
    ? "Sellers matching your filters at this institution"
    : "Local sellers and services around your institution";
  renderConnections(institution);
  updateRooms();
}

function updateFilterButtons() {
  for (const button of $$(".category-tile")) {
    const selected = button.dataset.category === activeCategory;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  }
}

function renderSellerProfile(card) {
  activeSeller = card.dataset.seller;
  const profile = getProfile();
  const photos = card.dataset.photos ? JSON.parse(card.dataset.photos) : [];
  const reviews = getReviews().filter((review) => review.seller === activeSeller);
  const ratingText = ratingForSeller(activeSeller, $(".rating", card)?.textContent || "New seller");
  const number = phoneForWhatsApp(card.dataset.phone);
  const area = card.dataset.area.replace(/\b\w/g, (letter) => letter.toUpperCase());
  const owner = card.dataset.owner || activeSeller;
  const details = $("#seller-profile-body");
  details.replaceChildren();
  const photo = document.createElement("div");
  photo.className = "profile-avatar";
  if (photos[0]) photo.style.backgroundImage = `url("${photos[0]}")`;
  else photo.textContent = owner.charAt(0).toUpperCase();
  const tag = document.createElement("div");
  tag.className = "eyebrow section-eyebrow";
  tag.textContent = "CAMPUS SELLER";
  const title = document.createElement("h2");
  title.textContent = activeSeller;
  const institution = document.createElement("p");
  institution.className = "dialog-description";
  institution.textContent = `${institutionName(card.dataset.campus)} · ${area}`;
  const hours = document.createElement("p");
  hours.className = "profile-hours";
  hours.textContent = "● Open / hours set directly with seller";
  const productHeading = document.createElement("h3");
  productHeading.textContent = "Listed product";
  const product = document.createElement("div");
  product.className = "profile-product";
  product.textContent = `${card.dataset.product} · ${$(".listing-bottom strong", card)?.textContent || ""}`;
  const rating = document.createElement("p");
  rating.className = "profile-rating";
  rating.textContent = `★ ${ratingText} · ${reviews.length} local review${reviews.length === 1 ? "" : "s"}`;
  const reviewList = document.createElement("div");
  reviewList.className = "profile-reviews";
  if (!reviews.length) {
    const noReviews = document.createElement("p");
    noReviews.className = "form-hint";
    noReviews.textContent = "No browser-local reviews yet.";
    reviewList.append(noReviews);
  } else {
    for (const review of reviews.slice(-4).reverse()) {
      const reviewItem = document.createElement("p");
      reviewItem.className = "profile-review";
      reviewItem.textContent = `${"★".repeat(Number(review.rating))} · ${review.comment}`;
      reviewList.append(reviewItem);
    }
  }
  const actions = document.createElement("div");
  actions.className = "profile-actions";
  const call = document.createElement("a");
  call.className = "button button-outline";
  call.href = number ? `tel:+${number}` : "#";
  call.textContent = number ? "Call seller" : "Phone not added";
  if (!number) call.setAttribute("aria-disabled", "true");
  const order = document.createElement("a");
  order.className = "button button-green";
  const message = `Hi, I saw your ${card.dataset.product} on ComradeSoko at ${area}. Is it available?`;
  order.href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  order.target = "_blank";
  order.rel = "noopener noreferrer";
  order.dataset.whatsapp = "";
  order.dataset.profileOrder = "true";
  order.textContent = "Order on WhatsApp";
  actions.append(call, order);
  const reviewButton = document.createElement("button");
  reviewButton.className = "button button-outline review-trigger";
  reviewButton.type = "button";
  reviewButton.dataset.seller = activeSeller;
  const canReview = profile && getOrders().some((item) => item.seller === activeSeller && (item.buyerId === profile.id || item.buyer === profile.name));
  const hasReviewed = profile && getReviews().some((review) => review.seller === activeSeller && (review.reviewerId === profile.id || review.reviewer === profile.name));
  reviewButton.disabled = !canReview || hasReviewed;
  reviewButton.textContent = hasReviewed ? "You already reviewed" : canReview ? "Review after order" : "Order first to unlock review";
  reviewButton.addEventListener("click", () => {
    $("#review-seller-name").textContent = activeSeller;
    reviewDialog.showModal();
  });
  const inboxButton = document.createElement("button");
  inboxButton.className = "button button-outline review-trigger";
  inboxButton.type = "button";
  inboxButton.textContent = "Message seller in ComradeSoko inbox";
  inboxButton.addEventListener("click", () => openConversation({
    id: card.dataset.ownerId || `seller:${card.dataset.campus}:${activeSeller}`,
    name: activeSeller,
    institution: card.dataset.campus
  }, `Hi ${activeSeller}, I’m interested in ${card.dataset.product} listed on ComradeSoko.`));
  const mapHeading = document.createElement("h3");
  mapHeading.textContent = "Find the area";
  const mapDescription = document.createElement("p");
  mapDescription.className = "map-disclaimer";
  mapDescription.textContent = "Approximate area from the seller’s listing; this is not a verified shop pin.";
  const map = document.createElement("div");
  map.className = "profile-map";
  const mapButton = document.createElement("button");
  mapButton.className = "button button-outline map-toggle";
  mapButton.type = "button";
  mapButton.textContent = "⌖ Show Google Maps preview";
  mapButton.addEventListener("click", () => {
    if (map.querySelector("iframe")) return;
    const query = `${area}, ${institutionName(card.dataset.campus)}, Kenya`;
    const embed = document.createElement("iframe");
    embed.title = `Google Maps preview of ${area}, ${institutionName(card.dataset.campus)}`;
    embed.src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
    embed.loading = "lazy";
    embed.referrerPolicy = "strict-origin-when-cross-origin";
    embed.allowFullscreen = true;
    map.append(embed);
    mapButton.textContent = "Google Maps preview";
    mapButton.disabled = true;
  });
  const mapLink = document.createElement("a");
  mapLink.className = "map-link";
  mapLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${area}, ${institutionName(card.dataset.campus)}, Kenya`)}`;
  mapLink.target = "_blank";
  mapLink.rel = "noopener noreferrer";
  mapLink.textContent = "Open area in Google Maps ↗";
  map.append(mapButton, mapLink);
  details.append(photo, tag, title, institution, hours, productHeading, product, rating, reviewList, actions, reviewButton, inboxButton, mapHeading, mapDescription, map);
  if (profile && profile.institution === campusFilter.value && card.dataset.campus !== profile.institution) {
    showToast("Seller profiles from another institution are hidden by the campus lock.");
    return;
  }
  if (profile && card.dataset.id) {
    const products = getProducts();
    const current = products.find((item) => item.id === card.dataset.id);
    if (current) {
      current.views = (current.views || 0) + 1;
      if (writeStore(STORE.products, products)) renderDashboard();
    }
  }
  sellerDialog.showModal();
}

function renderDashboard() {
  const profile = getProfile();
  const dashboard = $("#dashboard-content");
  dashboard.replaceChildren();
  renderInbox();
  if (!profile) {
    $("#dashboard-title").textContent = "Your dashboard.";
    const prompt = document.createElement("div");
    prompt.className = "dashboard-empty";
    prompt.textContent = "Create a local profile to see your saved sellers, order intents, seller tools, campus listings, and escrow demo.";
    const join = document.createElement("button");
    join.type = "button";
    join.className = "button button-dark";
    join.textContent = "Create a profile";
    join.addEventListener("click", () => accountDialog.showModal());
    dashboard.append(prompt, join);
    return;
  }

  $("#dashboard-title").textContent = `Kia ora, ${profile.name.split(" ")[0]}.`;
  const welcome = document.createElement("div");
  welcome.className = "dashboard-welcome";
  welcome.textContent = `${roleName(profile.role)} · ${institutionName(profile.institution)} · ${profile.area}`;
  dashboard.append(welcome);

  const savedSellers = getSaves();
  const orders = getOrders().filter((order) => order.buyerId === profile.id || (!order.buyerId && order.buyer === profile.name));
  const stats = document.createElement("div");
  stats.className = "dashboard-stats";
  [["Saved sellers", savedSellers.length], ["Order intents", orders.length], ["Your role", roleName(profile.role)]].forEach(([label, value]) => {
    const item = document.createElement("div");
    item.className = "stat-card";
    const amount = document.createElement("strong");
    amount.textContent = value;
    const caption = document.createElement("span");
    caption.textContent = label;
    item.append(amount, caption);
    stats.append(item);
  });
  dashboard.append(stats);
  const personalProducts = getProducts().filter((product) => product.ownerId === profile.id || (!product.ownerId && product.owner === profile.name));

  if (isSellerRole(profile.role)) {
    const sellerHeading = document.createElement("div");
    sellerHeading.className = "dashboard-subheading";
    const title = document.createElement("h3");
    title.textContent = "Your shop";
    const add = document.createElement("button");
    add.type = "button";
    add.className = "button button-dark compact-button";
    add.textContent = "+ Add product";
    add.addEventListener("click", () => {
      $("#product-area").value = profile.area;
      productDialog.showModal();
    });
    sellerHeading.append(title, add);
    dashboard.append(sellerHeading);
    if (!personalProducts.length) {
      const message = document.createElement("p");
      message.className = "form-hint";
      message.textContent = "No local listings yet. Add your first product to this campus soko.";
      dashboard.append(message);
    }
    for (const product of personalProducts) {
      const row = document.createElement("div");
      row.className = "dashboard-product";
      const summary = document.createElement("span");
      summary.textContent = `${product.name} · KSh ${Number(product.price).toLocaleString("en-KE")} · ${product.views || 0} profile views`;
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "text-button";
      toggle.dataset.productId = product.id;
      toggle.dataset.action = "toggle-stock";
      toggle.textContent = product.soldOut ? "Mark available" : "Mark sold out";
      row.append(summary, toggle);
      dashboard.append(row);
    }
  } else {
    const summary = document.createElement("div");
    summary.className = "dashboard-subheading";
    const title = document.createElement("h3");
    title.textContent = "Your recent order intents";
    summary.append(title);
    dashboard.append(summary);
    const recent = orders.slice(-4).reverse();
    const orderList = document.createElement("div");
    orderList.className = "orders-list";
    if (!recent.length) {
      const message = document.createElement("p");
      message.className = "form-hint";
      message.textContent = "No order intents yet. WhatsApp orders you start from listings appear here.";
      orderList.append(message);
    }
    recent.forEach((order) => {
      const row = document.createElement("p");
      row.textContent = `${order.product} · ${order.seller} · ${new Date(order.createdAt).toLocaleDateString()}`;
      orderList.append(row);
    });
    dashboard.append(orderList);
  }

  renderEscrowDashboard(dashboard, profile);

  const savedHeading = document.createElement("div");
  savedHeading.className = "dashboard-subheading";
  const savedTitle = document.createElement("h3");
  savedTitle.textContent = "Saved sellers";
  savedHeading.append(savedTitle);
  dashboard.append(savedHeading);
  const savedList = document.createElement("p");
  savedList.className = "form-hint";
  savedList.textContent = savedSellers.length ? savedSellers.join(" · ") : "Tap ♡ on a seller to save them here.";
  dashboard.append(savedList);

  const exit = document.createElement("button");
  exit.type = "button";
  exit.className = "text-button signout-button";
  exit.textContent = "Sign out and clear this browser profile";
  exit.addEventListener("click", async () => {
    try {
      await window.ComradeSokoAuth?.signOut();
    } catch (error) {
      console.error("Could not sign out from Firebase Authentication.", error);
      showToast("Could not sign out. Check your connection and try again.");
      return;
    }
    localStorage.removeItem(STORE.profile);
    $("#account-button").innerHTML = 'Join / account <span aria-hidden="true">↗</span>';
    renderDashboard();
    renderProducts();
    renderRooms();
    updateListings();
    showToast("Signed out. Your saved local listings remain in this browser.");
  });
  dashboard.append(exit);
}

function renderInbox() {
  const profile = getProfile();
  const conversations = getConversations()
    .filter((conversation) => profile && conversation.participants.some((participant) => participant.id === profile.id))
    .sort((first, second) => {
      const firstTime = first.messages.at(-1)?.createdAt || "";
      const secondTime = second.messages.at(-1)?.createdAt || "";
      return secondTime.localeCompare(firstTime);
    });
  const list = $("#inbox-list");
  const thread = $("#inbox-thread");
  list.replaceChildren();
  thread.replaceChildren();
  if (!profile) {
    const note = document.createElement("p");
    note.className = "inbox-empty";
    note.textContent = "Create a local profile to start a conversation.";
    const join = document.createElement("button");
    join.type = "button";
    join.className = "button button-dark";
    join.textContent = "Join / account";
    join.addEventListener("click", () => accountDialog.showModal());
    list.append(note, join);
    thread.textContent = "Your conversation will appear here.";
    return;
  }
  if (!conversations.length) {
    const note = document.createElement("p");
    note.className = "inbox-empty";
    note.textContent = "No messages yet. Start a chat from a campus seller listing or a Comrades Hub post.";
    list.append(note);
    thread.textContent = "Choose a seller or campus post to start a conversation.";
    return;
  }
  for (const conversation of conversations) {
    const other = conversation.participants.find((participant) => participant.id !== profile.id);
    if (!other) continue;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `conversation-item${conversation.id === activeConversationId ? " selected" : ""}`;
    button.dataset.conversationId = conversation.id;
    const name = document.createElement("strong");
    name.textContent = other.name;
    const snippet = document.createElement("span");
    snippet.textContent = conversation.messages.at(-1)?.text || "Start the conversation";
    button.append(name, snippet);
    button.addEventListener("click", () => {
      activeConversationId = conversation.id;
      renderInbox();
    });
    list.append(button);
  }
  let selected = conversations.find((conversation) => conversation.id === activeConversationId) || conversations[0];
  activeConversationId = selected.id;
  const other = selected.participants.find((participant) => participant.id !== profile.id);
  const heading = document.createElement("div");
  heading.className = "thread-heading";
  const title = document.createElement("strong");
  title.textContent = other?.name || "Campus member";
  const campus = document.createElement("span");
  campus.textContent = institutionName(selected.institution);
  heading.append(title, campus);
  const messages = document.createElement("div");
  messages.className = "thread-messages";
  for (const message of selected.messages) {
    const bubble = document.createElement("article");
    bubble.className = `message-bubble${message.senderId === profile.id ? " own-message" : ""}`;
    const author = document.createElement("strong");
    author.textContent = message.senderId === profile.id ? "You" : message.senderName;
    const body = document.createElement("p");
    body.textContent = message.text;
    const time = document.createElement("time");
    time.dateTime = message.createdAt;
    time.textContent = new Date(message.createdAt).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" });
    bubble.append(author, body, time);
    messages.append(bubble);
  }
  if (!selected.messages.length) {
    const note = document.createElement("p");
    note.className = "inbox-empty";
    note.textContent = "Say hello to start your conversation.";
    messages.append(note);
  }
  const form = document.createElement("form");
  form.className = "message-compose";
  form.dataset.conversationId = selected.id;
  const input = document.createElement("textarea");
  input.name = "message";
  input.maxLength = 1000;
  input.placeholder = "Write a message...";
  input.setAttribute("aria-label", "Write a message");
  input.required = true;
  const send = document.createElement("button");
  send.type = "submit";
  send.className = "button button-dark";
  send.textContent = "Send";
  form.append(input, send);
  thread.append(heading, messages, form);
  messages.scrollTop = messages.scrollHeight;
}

function discussionCommentsFor(targetId, targetType) {
  return readStore(STORE.comments, []).filter((comment) => {
    if (targetType === "listing") return comment.listingId === targetId;
    if (targetType === "room") return comment.roomId === targetId;
    return comment.postId === targetId && !comment.listingId && !comment.roomId;
  });
}

function ensureDiscussionCommentIds() {
  const comments = readStore(STORE.comments, []);
  let changed = false;
  for (const comment of comments) {
    if (!comment.id) {
      comment.id = idFor("comment");
      changed = true;
    }
  }
  if (changed) writeStore(STORE.comments, comments);
}

function makeDiscussionForm(targetId, targetType, parentId = "") {
  const form = document.createElement("form");
  form.className = "discussion-form";
  form.dataset.targetId = targetId;
  form.dataset.targetType = targetType;
  if (parentId) form.dataset.parentId = parentId;
  const input = document.createElement("input");
  input.name = "comment";
  input.maxLength = 500;
  input.placeholder = getProfile() ? (parentId ? "Write a reply..." : "Ask a question or share your thoughts...") : "Create a local profile to join the discussion";
  input.setAttribute("aria-label", parentId ? "Write a reply" : "Ask a question or share your thoughts");
  input.required = true;
  input.disabled = !getProfile();
  const submit = document.createElement("button");
  submit.type = "submit";
  submit.textContent = parentId ? "Reply" : "Comment";
  submit.disabled = !getProfile();
  form.append(input, submit);
  return form;
}

function makeDiscussion(targetId, targetType) {
  const wrapper = document.createElement("div");
  wrapper.className = "post-discussion";
  const disclaimer = document.createElement("p");
  disclaimer.className = "discussion-disclaimer";
  disclaimer.textContent = "Local prototype discussion: comments are saved only in this browser.";
  const comments = discussionCommentsFor(targetId, targetType);
  const threads = document.createElement("div");
  threads.className = "discussion-comments";

  function appendComment(comment, parent, depth, ancestors) {
    if (ancestors.has(comment.id)) return;
    const item = document.createElement("article");
    item.className = "discussion-comment";
    item.style.marginLeft = `${Math.min(depth, 4) * 12}px`;
    const heading = document.createElement("div");
    heading.className = "discussion-comment-heading";
    const author = document.createElement("strong");
    author.textContent = comment.name || "Comrade";
    const time = document.createElement("time");
    if (comment.createdAt) {
      time.dateTime = comment.createdAt;
      time.textContent = new Date(comment.createdAt).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" });
    }
    heading.append(author, time);
    const text = document.createElement("p");
    text.textContent = comment.text;
    item.append(heading, text);
    const descendants = new Set(ancestors);
    if (comment.id) descendants.add(comment.id);
    const replies = comments.filter((reply) => reply.parentId === comment.id);
    if (depth < 4 && comment.id) {
      const replyButton = document.createElement("button");
      replyButton.type = "button";
      replyButton.className = "discussion-reply-button";
      replyButton.textContent = "Reply";
      replyButton.addEventListener("click", () => {
        if (!getProfile()) {
          accountDialog.showModal();
          return;
        }
        if ($(".discussion-form", item)) return;
        const form = makeDiscussionForm(targetId, targetType, comment.id);
        item.append(form);
        $("input", form).focus();
      });
      item.append(replyButton);
    }
    for (const reply of replies) appendComment(reply, item, depth + 1, descendants);
    parent.append(item);
  }

  comments.filter((comment) => !comment.parentId).forEach((comment) => appendComment(comment, threads, 0, new Set()));
  if (!threads.childElementCount) {
    const empty = document.createElement("p");
    empty.className = "discussion-empty";
    empty.textContent = "No comments yet. Ask a question or share your thoughts.";
    threads.append(empty);
  }
  wrapper.append(disclaimer, threads, makeDiscussionForm(targetId, targetType));
  if (!getProfile()) {
    const join = document.createElement("button");
    join.type = "button";
    join.className = "discussion-join-button";
    join.textContent = "Join / account to comment";
    join.addEventListener("click", () => accountDialog.showModal());
    wrapper.append(join);
  }
  return wrapper;
}

function renderHub() {
  const institution = campusFilter.value;
  const feed = $("#hub-feed-list");
  feed.replaceChildren();
  const userPosts = readStore(STORE.posts, []);
  const posts = [...userPosts, ...sampleHubPosts].filter((post) => post.institution === institution);
  $("#hub-form-hint").textContent = institution
    ? `Posting to ${institutionName(institution)} only. Join with a local profile to contribute.`
    : "Choose your institution and join to post.";
  $("#hub-post-form button").disabled = !institution || !getProfile();
  for (const post of posts) {
    const card = document.createElement("article");
    card.className = "hub-post";
    const meta = document.createElement("div");
    meta.className = "hub-post-meta";
    const who = document.createElement("strong");
    who.textContent = post.name;
    const where = document.createElement("span");
    where.textContent = `${post.area} · ${post.time || "Just now"}`;
    meta.append(who, where);
    const type = document.createElement("span");
    type.className = "connection-tag";
    type.textContent = post.kind;
    const content = document.createElement("p");
    content.textContent = post.content;
    const actions = document.createElement("div");
    actions.className = "hub-post-actions";
    const collaborate = document.createElement("a");
    collaborate.href = `https://wa.me/?text=${encodeURIComponent(`Hi ${post.name}, I saw your campus post on ComradeSoko and would like to connect.`)}`;
    collaborate.target = "_blank";
    collaborate.rel = "noopener noreferrer";
    collaborate.textContent = "Connect";
    const message = document.createElement("button");
    message.type = "button";
    message.className = "hub-message-button";
    message.dataset.action = "message-post-author";
    message.dataset.contactId = post.authorId || `hub:${post.institution}:${post.name}`;
    message.dataset.contactName = post.name;
    message.dataset.institution = post.institution;
    message.textContent = "Inbox";
    const share = document.createElement("button");
    share.type = "button";
    share.className = "hub-share-button";
    share.dataset.action = "share-post";
    share.dataset.postId = post.id;
    share.textContent = "Share";
    actions.append(message, share, collaborate);
    card.append(meta, type, content, makeDiscussion(post.id, "hub"), actions);
    feed.append(card);
  }
  if (!institution) {
    const note = document.createElement("p");
    note.className = "feed-placeholder";
    note.textContent = "Choose an institution above to see its local ideas and skills feed.";
    feed.append(note);
  } else if (!posts.length) {
    const note = document.createElement("p");
    note.className = "feed-placeholder";
    note.textContent = "No campus posts yet. Be the first to share an idea.";
    feed.append(note);
  }
}

async function compressImage(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 720 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser could not prepare the selected image.");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.68);
}

function updateConditionalFields() {
  const category = $("#product-category").value;
  const delivery = ["gas", "water"].includes(category);
  $("#delivery-fields").hidden = !delivery;
  $("#delivery-fee").required = delivery;
  $("#delivery-time").required = delivery;
  $("#product-stock").required = delivery;
  const food = category === "food";
  $("#menu-field").hidden = !food;
  $("#product-menu").required = food;
}

async function onProductSubmit(event) {
  event.preventDefault();
  const profile = getProfile();
  if (!profile || !isSellerRole(profile.role)) {
    showToast("Save a seller or local-provider profile before posting a product.");
    productDialog.close();
    accountDialog.showModal();
    return;
  }
  if (profile.role === "seller" && getProducts().filter((product) => product.ownerId === profile.id).length >= 20) {
    showToast("Comrade Sellers can have up to 20 products in this prototype.");
    return;
  }
  const photos = [...$("#product-photos").files];
  if (photos.length > 3) {
    showToast("Choose no more than 3 photos for one listing.");
    return;
  }
  if (photos.some((file) => !file.type.startsWith("image/"))) {
    showToast("Only image files can be added to a listing.");
    return;
  }
  const submit = $('button[type="submit"]', $("#product-form"));
  submit.disabled = true;
  submit.textContent = "Preparing photos…";
  try {
    const compressed = await Promise.all(photos.map(compressImage));
    const category = $("#product-category").value;
    const stock = ["gas", "water"].includes(category) ? Number($("#product-stock").value) : 1;
    const item = {
      id: idFor("product"),
      category,
      name: $("#product-name").value.trim(),
      price: Number($("#product-price").value),
      area: $("#product-area").value.trim(),
      institution: profile.institution,
      seller: profile.shopName || profile.name,
      owner: profile.name,
      ownerId: profile.id,
      phone: profile.phone || "",
      photos: compressed,
      deliveryFee: ["gas", "water"].includes(category) ? Number($("#delivery-fee").value) : 0,
      deliveryTime: ["gas", "water"].includes(category) ? Number($("#delivery-time").value) : "",
      stock,
      menu: category === "food" ? $("#product-menu").value.trim() : "",
      views: 0,
      soldOut: ["gas", "water"].includes(category) && stock === 0,
      createdAt: new Date().toISOString()
    };
    const products = getProducts();
    products.push(item);
    if (!writeStore(STORE.products, products)) return;
    $("#product-form").reset();
    $("#product-area").value = profile.area;
    updateConditionalFields();
    renderProducts();
    renderDashboard();
    updateAreaOptions();
    updateListings();
    productDialog.close();
    showToast("Your listing was added to this browser’s campus soko.");
  } catch (error) {
    console.error("Could not prepare product listing.", error);
    showToast(error.message || "Could not prepare those photos. Try different image files.");
  } finally {
    submit.disabled = false;
    submit.textContent = "Publish sample listing";
  }
}

function initializeProfile() {
  populateInstitutionSelectors();
  ensureDiscussionCommentIds();
  const profile = getProfile();
  if (profile) {
    campusFilter.value = profile.institution;
    $("#account-button").textContent = accountButtonLabel(profile);
  }
  renderProducts();
  updateAreaOptions();
  updateListings();
  renderHub();
  renderDashboard();
}

campusFilter.addEventListener("change", () => {
  if (campusFilter.value === "request-institution") {
    campusFilter.value = "";
    window.location.href = "mailto:hello@comradesoko.co.ke?subject=Add%20my%20institution%20to%20ComradeSoko";
    return;
  }
  activeCategory = "";
  updateFilterButtons();
  updateAreaOptions();
  updateListings();
  renderHub();
});

areaFilter.addEventListener("change", updateListings);
searchInput.addEventListener("input", () => {
  updateListings();
  updateRooms();
});
roomBudget.addEventListener("change", updateRooms);

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!campusFilter.value) {
    campusFilter.focus();
    institutionStatus.textContent = "Choose your institution first to search your local soko.";
    return;
  }
  updateListings();
  $("#trending").scrollIntoView({ behavior: "smooth", block: "start" });
});

for (const button of $$(".category-tile")) {
  button.addEventListener("click", () => {
    if (!campusFilter.value) {
      campusFilter.focus();
      institutionStatus.textContent = "Choose your institution first to browse local categories.";
      return;
    }
    activeCategory = activeCategory === button.dataset.category ? "" : button.dataset.category;
    updateFilterButtons();
    updateListings();
  });
}

listingGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  const card = event.target.closest(".listing-card");
  if (!button || !card) return;

  if (button.dataset.action === "toggle-discussion") {
    const discussion = $(".listing-discussion", card);
    discussion.hidden = !discussion.hidden;
    button.setAttribute("aria-expanded", String(!discussion.hidden));
    if (!discussion.hidden) $(".discussion-form input", discussion)?.focus();
    return;
  }
  if (button.dataset.action === "view-seller") {
    renderSellerProfile(card);
    return;
  }
  if (button.dataset.action === "message-seller") {
    openConversation({
      id: card.dataset.ownerId || `seller:${card.dataset.campus}:${card.dataset.seller}`,
      name: card.dataset.seller,
      institution: card.dataset.campus
    }, `Hi ${card.dataset.seller}, I’m interested in ${card.dataset.product} listed on ComradeSoko.`);
    return;
  }
  if (button.dataset.action === "save-seller") {
    const profile = getProfile();
    if (!profile) {
      showToast("Create a local profile to save sellers.");
      accountDialog.showModal();
      return;
    }
    if (card.dataset.campus !== profile.institution) {
      showToast("The institution lock only lets you save sellers from your campus.");
      return;
    }
    const saves = getSaves();
    const index = saves.indexOf(card.dataset.seller);
    if (index === -1) saves.push(card.dataset.seller);
    else saves.splice(index, 1);
    if (writeStore(STORE.saves, saves)) {
      addCardControls(card);
      renderDashboard();
      showToast(index === -1 ? "Seller saved to your local dashboard." : "Seller removed from saved list.");
    }
  }
});

listingGrid.addEventListener("click", (event) => {
  const link = event.target.closest("[data-whatsapp]");
  const card = event.target.closest(".listing-card");
  if (!link || !card || link.classList.contains("disabled-order")) return;
  const profile = getProfile();
  if (profile && profile.institution !== card.dataset.campus) {
    event.preventDefault();
    showToast("Orders are restricted to the institution on your local profile.");
    return;
  }
  if (profile) {
    const orders = getOrders();
    orders.push({ id: idFor("order"), buyer: profile.name, buyerId: profile.id, institution: profile.institution, seller: card.dataset.seller, product: card.dataset.product, createdAt: new Date().toISOString() });
    if (writeStore(STORE.orders, orders)) renderDashboard();
  }
});

sellerDialog.addEventListener("click", (event) => {
  const link = event.target.closest("[data-profile-order]");
  const profile = getProfile();
  if (!link || !profile || !activeSeller) return;
  if (profile.institution !== campusFilter.value) {
    event.preventDefault();
    showToast("Orders are restricted to the institution on your local profile.");
    return;
  }
  const card = allListingElements().find((item) => item.dataset.seller === activeSeller);
  if (!card || card.dataset.campus !== profile.institution) return;
  const orders = getOrders();
  orders.push({ id: idFor("order"), buyer: profile.name, buyerId: profile.id, institution: profile.institution, seller: activeSeller, product: card.dataset.product, createdAt: new Date().toISOString() });
  if (writeStore(STORE.orders, orders)) renderDashboard();
});

$("#account-button").addEventListener("click", () => {
  const profile = getProfile();
  if (profile) {
    $("#profile-name").value = profile.name;
    $("#profile-role").value = profile.role;
    $("#profile-shop-name").value = profile.shopName || "";
    $("#profile-campus").value = profile.institution;
    $("#profile-area").value = profile.area;
    $("#profile-phone").value = profile.phone || "";
    $("#provider-agreement-check").checked = Boolean(profile.providerAgreementAcknowledged);
    $("#account-dialog-title").textContent = "Update your local profile.";
  } else {
    $("#account-form").reset();
    $("#provider-agreement-check").checked = false;
    $("#account-dialog-title").textContent = "Create your local profile.";
  }
  updateProfileRoleFields();
  accountDialog.showModal();
});

$("#partner-join-button").addEventListener("click", () => {
  $("#account-button").click();
  $("#profile-role").value = "local-provider";
  $("#provider-agreement-check").checked = false;
  updateProfileRoleFields();
});

$("#account-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const previousProfile = getProfile();
  const user = window.ComradeSokoAuth?.getCurrentUser();
  const profileDetails = {
    id: previousProfile?.id || idFor("user"),
    name: $("#profile-name").value.trim(),
    role: $("#profile-role").value,
    shopName: isSellerRole($("#profile-role").value) ? ($("#profile-shop-name").value.trim() || $("#profile-name").value.trim()) : "",
    institution: $("#profile-campus").value,
    area: $("#profile-area").value.trim(),
    phone: $("#profile-phone").value.trim(),
    providerAgreementAcknowledged: $("#profile-role").value === "local-provider" && $("#provider-agreement-check").checked,
    createdAt: getProfile()?.createdAt || new Date().toISOString()
  };
  let profile = profileDetails;
  const photo = $("#profile-photo").files[0];
  if (user && (user.phoneNumber || user.emailVerified) && photo) {
    try {
      profile = await window.ComradeSokoAuth.completeProfile(profileDetails, photo);
    } catch (error) {
      console.error("Could not complete optional Firebase profile sync.", error);
      showToast(error.message || "Could not sync the verified profile. Check your connection and try again.");
      return;
    }
  }
  if (writeStore(STORE.profile, profile)) {
    campusFilter.value = profile.institution;
    $("#account-button").textContent = accountButtonLabel(profile);
    renderProducts();
    renderRooms();
    updateAreaOptions();
    updateListings();
    renderHub();
    renderDashboard();
    accountDialog.close();
    showToast(user && (user.phoneNumber || user.emailVerified) && photo
      ? "Verified profile saved in this browser and synced to Firebase."
      : "Profile saved in this browser. Verification is optional.");
  }
});

window.addEventListener("comradesoko:auth-state", (event) => {
  if (event.detail?.email || event.detail?.phoneNumber) {
    $("#auth-status").textContent = "Account verified. You can optionally sync your profile and photo to Firebase.";
  }
});

$("#profile-role").addEventListener("change", updateProfileRoleFields);

$("#product-category").addEventListener("change", updateConditionalFields);
$("#product-form").addEventListener("submit", onProductSubmit);

$("#hub-post-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const profile = getProfile();
  if (!profile || !campusFilter.value || campusFilter.value !== profile.institution) {
    showToast("Choose your profile institution and create a local profile to post.");
    return;
  }
  const posts = readStore(STORE.posts, []);
  posts.unshift({
    id: idFor("post"),
    authorId: profile.id,
    institution: profile.institution,
    name: profile.name,
    area: profile.area,
    kind: $("#hub-post-kind").value,
    content: $("#hub-post-content").value.trim(),
    time: "Just now"
  });
  if (writeStore(STORE.posts, posts)) {
    $("#hub-post-content").value = "";
    renderHub();
    showToast("Your post is visible in this browser’s campus feed.");
  }
});

function submitDiscussion(event) {
  const form = event.target.closest(".discussion-form");
  if (!form) return;
  event.preventDefault();
  const profile = getProfile();
  if (!profile) {
    showToast("Create a local profile to join the discussion.");
    accountDialog.showModal();
    return;
  }
  const text = $('input[name="comment"]', form).value.trim();
  if (!text) {
    $('input[name="comment"]', form).focus();
    return;
  }
  const comments = readStore(STORE.comments, []);
  const comment = {
    id: idFor("comment"),
    name: profile.name,
    text,
    parentId: form.dataset.parentId || "",
    createdAt: new Date().toISOString()
  };
  if (form.dataset.targetType === "listing") comment.listingId = form.dataset.targetId;
  else if (form.dataset.targetType === "room") comment.roomId = form.dataset.targetId;
  else comment.postId = form.dataset.targetId;
  if (writeStore(STORE.comments, [...comments, comment])) {
    renderProducts();
    updateListings();
    renderRooms();
    renderHub();
    const newDiscussion = form.dataset.targetType === "room"
      ? $(".room-discussion", $$(".room-card", roomGrid).find((card) => card.dataset.id === form.dataset.targetId))
      : form.dataset.targetType === "listing"
        ? $(".listing-discussion", allListingElements().find((card) => card.dataset.id === form.dataset.targetId))
        : $(".post-discussion", $$(".hub-post", $("#hub-feed-list")).find((card) => card.dataset.id === form.dataset.targetId));
    if (newDiscussion) {
      newDiscussion.hidden = false;
      const toggle = form.dataset.targetType === "room"
        ? $(`[aria-controls="${newDiscussion.id}"]`, roomGrid)
        : form.dataset.targetType === "listing"
          ? $(`[aria-controls="${newDiscussion.id}"]`, listingGrid)
          : null;
      if (toggle) toggle.setAttribute("aria-expanded", "true");
      if (form.dataset.targetType === "hub") newDiscussion.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
    showToast("Your comment was saved in this browser.");
  }
}

listingGrid.addEventListener("submit", submitDiscussion);
roomGrid.addEventListener("submit", submitDiscussion);
$("#hub-feed-list").addEventListener("submit", submitDiscussion);

roomGrid.addEventListener("click", (event) => {
  const button = event.target.closest('[data-action="toggle-room-discussion"]');
  if (!button) return;
  const discussion = document.getElementById(button.getAttribute("aria-controls"));
  if (!discussion) return;
  discussion.hidden = !discussion.hidden;
  button.setAttribute("aria-expanded", String(!discussion.hidden));
  if (!discussion.hidden) $(".discussion-form input", discussion)?.focus();
});

$("#hub-feed-list").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  if (button.dataset.action === "message-post-author") {
    openConversation({
      id: button.dataset.contactId,
      name: button.dataset.contactName,
      institution: button.dataset.institution
    });
    return;
  }
  if (button.dataset.action === "share-post") {
    const post = [...readStore(STORE.posts, []), ...sampleHubPosts].find((item) => item.id === button.dataset.postId);
    if (post) shareHubPost(post);
  }
});

$("#inbox-thread").addEventListener("submit", (event) => {
  const form = event.target.closest(".message-compose");
  if (!form) return;
  event.preventDefault();
  const profile = getProfile();
  if (!profile) {
    showToast("Create a local profile to send an inbox message.");
    accountDialog.showModal();
    return;
  }
  const text = $('textarea[name="message"]', form).value.trim();
  if (!text) return;
  const conversations = getConversations();
  const conversation = conversations.find((item) => item.id === form.dataset.conversationId && item.participants.some((participant) => participant.id === profile.id));
  if (!conversation) {
    showToast("That conversation is unavailable in this local profile.");
    renderInbox();
    return;
  }
  conversation.messages.push({ id: idFor("message"), senderId: profile.id, senderName: profile.name, text, createdAt: new Date().toISOString() });
  if (writeStore(STORE.conversations, conversations)) {
    activeConversationId = conversation.id;
    renderInbox();
    $("#inbox-thread textarea[name='message']").focus();
  }
});

$("#dashboard-content").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  if (button.dataset.action.startsWith("escrow-")) {
    const profile = getProfile();
    const escrows = readStore(STORE.escrows, []);
    const escrow = escrows.find((item) => item.id === button.dataset.escrowId && item.createdBy === profile?.id);
    if (!escrow) {
      showToast("That local demo transaction is unavailable.");
      return;
    }
    if (button.dataset.action === "escrow-confirm-buyer") escrow.buyerConfirmed = true;
    else if (button.dataset.action === "escrow-confirm-seller") escrow.sellerConfirmed = true;
    else if (button.dataset.action === "escrow-demo-release") {
      if (!escrow.buyerConfirmed || !escrow.sellerConfirmed) {
        showToast("Both buyer and seller must confirm delivery before the demo can record a release.");
        return;
      }
      escrow.adminReleased = true;
      escrow.releasedAt = new Date().toISOString();
    }
    if (writeStore(STORE.escrows, escrows)) {
      renderDashboard();
      showToast(escrow.adminReleased
        ? "Demo release recorded. No payment was made."
        : "Demo confirmation recorded. No payment was made.");
    }
    return;
  }
  if (button.dataset.action !== "toggle-stock") return;
  const products = getProducts();
  const product = products.find((item) => item.id === button.dataset.productId);
  if (!product) {
    showToast("That local product could not be found.");
    return;
  }
  product.soldOut = !product.soldOut;
  if (writeStore(STORE.products, products)) {
    renderProducts();
    renderDashboard();
    updateListings();
    showToast(product.soldOut ? "Listing marked sold out." : "Listing marked available.");
  }
});

$$(".footer-policies a").forEach((link) => link.addEventListener("click", () => {
  const policy = document.getElementById(link.hash.slice(1));
  if (policy) policy.open = true;
}));

$("#review-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const profile = getProfile();
  if (!profile || !activeSeller) {
    showToast("Create a local profile before reviewing a seller.");
    return;
  }
  if (profile.institution !== campusFilter.value) {
    showToast("Reviews are restricted to your selected institution.");
    return;
  }
  const reviews = getReviews();
  if (reviews.some((review) => review.seller === activeSeller && (review.reviewerId === profile.id || review.reviewer === profile.name))) {
    showToast("Your local profile has already reviewed this seller.");
    reviewDialog.close();
    return;
  }
  if (!getOrders().some((order) => order.seller === activeSeller && (order.buyerId === profile.id || order.buyer === profile.name))) {
    showToast("Start an order with this seller before leaving a review.");
    reviewDialog.close();
    return;
  }
  reviews.push({
    id: idFor("review"),
    seller: activeSeller,
    reviewer: profile.name,
    reviewerId: profile.id,
    institution: profile.institution,
    rating: Number($("#review-rating").value),
    comment: $("#review-comment").value.trim(),
    createdAt: new Date().toISOString()
  });
  if (writeStore(STORE.reviews, reviews)) {
    $("#review-form").reset();
    reviewDialog.close();
    renderProducts();
    updateListings();
    const card = allListingElements().find((item) => item.dataset.seller === activeSeller);
    if (card) renderSellerProfile(card);
    showToast("Local review saved. Reviews are not purchase-verified in this prototype.");
  }
});

$("#product-photos").addEventListener("change", (event) => {
  if (event.target.files.length > 3) {
    event.target.value = "";
    showToast("Choose no more than 3 photos for one listing.");
  }
});

$$("[data-close]").forEach((button) => button.addEventListener("click", () => button.closest("dialog").close()));
$$("dialog").forEach((dialog) => dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
}));

$("#profile-campus").addEventListener("change", () => {
  if ($("#profile-campus").value === "request-institution") {
    $("#profile-campus").value = "";
    window.location.href = "mailto:hello@comradesoko.co.ke?subject=Add%20my%20institution%20to%20ComradeSoko";
    return;
  }
  campusFilter.value = $("#profile-campus").value;
});

updateConditionalFields();
renderRooms();
initializeProfile();
renderHub();
