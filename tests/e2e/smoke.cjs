// Smoke test: serves the generated SPA, mocks Supabase (auth + PostgREST) with
// fixtures, signs in through the UI and visits every screen on desktop and
// mobile, failing on any console/page error. Screenshots land in tests/e2e/.shots.
// Run: npm run test:e2e   (needs Playwright + Chromium available)
const http = require('http')
const fs = require('fs')
const path = require('path')
const { chromium } = require('playwright')

const ROOT = path.resolve(__dirname, '../../.output/public')
const OUT = path.join(__dirname, '.shots')
fs.mkdirSync(OUT, { recursive: true })

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0])
  let file = path.join(ROOT, p)
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html')
  if (!fs.existsSync(file)) file = path.join(ROOT, '200.html')
  const ext = path.extname(file)
  const type = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' }[ext] || 'application/octet-stream'
  res.writeHead(200, { 'content-type': type })
  fs.createReadStream(file).pipe(res)
}).listen(4173)

// ---------------------------------------------------------------- fixtures
const ME = '00000000-0000-0000-0000-00000000000a'
const BOB = '00000000-0000-0000-0000-00000000000b'
const CARO = '00000000-0000-0000-0000-00000000000c'
const PERSONAL = '10000000-0000-0000-0000-000000000001'
const FLAT = '10000000-0000-0000-0000-000000000002'
const iso = (d) => d.toISOString().slice(0, 10)
const day = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return iso(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12)) }
const now = new Date().toISOString()

const profiles = {
  [ME]: { id: ME, display_name: 'Alice Martin', avatar_url: null, created_at: now },
  [BOB]: { id: BOB, display_name: 'Bob', avatar_url: null, created_at: now },
  [CARO]: { id: CARO, display_name: 'Carol Díaz', avatar_url: null, created_at: now },
}
const spaces = [
  { id: PERSONAL, kind: 'personal', name: 'Personal', description: null, icon: null, color: null, created_by: ME, created_at: now },
  { id: FLAT, kind: 'household', name: 'Calle Mayor 12', description: 'Third floor, the one with the plants', icon: null, color: '#d0457a', created_by: ME, created_at: now },
]
const members = [
  { space_id: PERSONAL, user_id: ME, role: 'owner', joined_at: now },
  { space_id: FLAT, user_id: ME, role: 'owner', joined_at: '2026-01-01T00:00:00Z' },
  { space_id: FLAT, user_id: BOB, role: 'member', joined_at: '2026-01-02T00:00:00Z' },
  { space_id: FLAT, user_id: CARO, role: 'admin', joined_at: '2026-01-03T00:00:00Z' },
]
const chores = [
  { id: 'c1', space_id: FLAT, title: 'Take out the trash', description: null, priority: 2, effort: 2, freq: 'weekly', every: 1, by_weekday: [1, 4], mode: 'fixed', start_date: day(-30), end_date: null, due_time: '21:00:00', strategy: 'rotation', rotation: [ME, BOB, CARO], active: true, generated_until: day(42), generated_count: 20, created_by: ME, created_at: now, updated_at: now },
  { id: 'c2', space_id: FLAT, title: 'Clean the bathroom', description: 'Sink, toilet, shower, floor', priority: 1, effort: 4, freq: 'weekly', every: 1, by_weekday: [6], mode: 'fixed', start_date: day(-30), end_date: null, due_time: null, strategy: 'balanced', rotation: [], active: true, generated_until: day(42), generated_count: 5, created_by: ME, created_at: now, updated_at: now },
  { id: 'c3', space_id: PERSONAL, title: 'Cut hair', description: null, priority: 0, effort: 1, freq: 'weekly', every: 5, by_weekday: [], mode: 'after_completion', start_date: day(-40), end_date: null, due_time: null, strategy: 'fixed', rotation: [ME], active: true, generated_until: day(9), generated_count: 2, created_by: ME, created_at: now, updated_at: now },
]
let n = 0
const task = (o) => ({ id: `t${++n}`, space_id: FLAT, chore_id: null, description: null, priority: 0, effort: 1, due_time: null, assignee_id: ME, status: 'open', closed_at: null, completed_by: null, detached: false, occurrence: null, created_by: ME, created_at: now, updated_at: now, ...o })
const tasks = [
  task({ title: 'Take out the trash', chore_id: 'c1', due_date: day(-1), due_time: '21:00:00', priority: 2, effort: 2 }),
  task({ title: 'Buy bin bags', due_date: day(0), priority: 3 }),
  task({ title: 'Pay electricity bill', due_date: day(0), space_id: PERSONAL, priority: 4 }),
  task({ title: 'Clean the bathroom', chore_id: 'c2', due_date: day(2), assignee_id: BOB, effort: 4 }),
  task({ title: 'Take out the trash', chore_id: 'c1', due_date: day(3), assignee_id: BOB, due_time: '21:00:00' }),
  task({ title: 'Take out the trash', chore_id: 'c1', due_date: day(6), assignee_id: CARO, due_time: '21:00:00' }),
  task({ title: 'Water the plants', due_date: day(1), assignee_id: null }),
  task({ title: 'Fix loose toilet seal', due_date: null, assignee_id: null, priority: 2 }),
  task({ title: 'Cut hair', chore_id: 'c3', space_id: PERSONAL, due_date: day(9) }),
  task({ title: 'Descale kettle', due_date: day(-2), status: 'done', closed_at: now, completed_by: ME }),
]
const INITIAL_TASKS = JSON.stringify(tasks)
const trades = [
  { id: 'tr1', space_id: FLAT, task_id: 't5', from_user: BOB, to_user: ME, counter_task_id: 't1', message: "I'm away Thursday, swap?", status: 'pending', created_at: now, responded_at: null, responded_by: null },
]
const stats = [
  { space_id: FLAT, user_id: ME, role: 'owner', done_30d: 9, effort_30d: 16, open_assigned: 2, overdue: 1 },
  { space_id: FLAT, user_id: BOB, role: 'member', done_30d: 6, effort_30d: 12, open_assigned: 2, overdue: 0 },
  { space_id: FLAT, user_id: CARO, role: 'admin', done_30d: 8, effort_30d: 14, open_assigned: 1, overdue: 0 },
]
const activity = [
  { id: 3, space_id: FLAT, actor_id: CARO, verb: 'task.completed', task_id: null, subject: 'Mop the hallway', data: {}, created_at: now },
  { id: 2, space_id: FLAT, actor_id: BOB, verb: 'trade.proposed', task_id: 't5', subject: 'Take out the trash', data: { to_user: ME }, created_at: now },
  { id: 1, space_id: FLAT, actor_id: CARO, verb: 'member.joined', task_id: null, subject: null, data: {}, created_at: now },
]

// ------------------------------------------------------------- fake server
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')
const jwt = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: ME, email: 'alice@example.com', role: 'authenticated', aud: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600, session_id: 's1' })}.sig`
const user = { id: ME, aud: 'authenticated', role: 'authenticated', email: 'alice@example.com', app_metadata: {}, user_metadata: {}, created_at: now }

function rest(table, method, body, url) {
  const q = url.searchParams
  if (table === 'rpc/sync_my_spaces') return 0
  if (table === 'rpc/invite_preview') return [{ space_id: FLAT, name: 'Calle Mayor 12', description: 'Third floor', icon: null, color: null, member_count: 3, already_member: false, valid: true, reason: null }]
  if (table.startsWith('rpc/')) return null
  if (method !== 'GET') {
    if (table === 'tasks' && method === 'POST') { const t = task(body); tasks.push(t); return [t] }
    if (table === 'tasks' && method === 'PATCH') {
      const id = (q.get('id') || '').replace('eq.', '')
      const t = tasks.find(x => x.id === id); Object.assign(t, body); return [t]
    }
    if (table === 'space_invites') return [{ id: 'i1', space_id: FLAT, token: 'abc123', created_by: ME, expires_at: new Date(Date.now() + 7 * 864e5).toISOString(), max_uses: null, use_count: 0, revoked_at: null, created_at: now }]
    return [body]
  }
  switch (table) {
    case 'space_members':
      if ((q.get('select') || '').includes('space:spaces')) return members.filter(m => m.user_id === ME).map(m => ({ role: m.role, space: spaces.find(s => s.id === m.space_id) }))
      return members.map(m => ({ ...m, profile: profiles[m.user_id] }))
    case 'member_stats': return stats
    case 'tasks': {
      let rows = tasks
      if (q.get('status') === 'eq.open') rows = rows.filter(t => t.status === 'open')
      if (q.get('status') === 'neq.open') rows = rows.filter(t => t.status !== 'open')
      return rows
    }
    case 'chores': return chores
    case 'task_trades': return trades
    case 'activity': return activity
    case 'space_invites': return []
  }
  return []
}

;(async () => {
  const browser = await chromium.launch()
  const errors = []
  async function run(viewport, tag) {
    tasks.splice(0, tasks.length, ...JSON.parse(INITIAL_TASKS))
    const page = await browser.newPage({ viewport })
    page.on('console', m => { if (m.type() === 'error' && !/WebSocket|realtime|ERR_NAME_NOT_RESOLVED|favicon/i.test(m.text())) errors.push(`[${tag}] console: ${m.text()}`) })
    page.on('pageerror', e => errors.push(`[${tag}] pageerror: ${e.message}`))
    page.on('dialog', d => d.accept())

    await page.route('http://sb.test/**', async (route) => {
      const req = route.request()
      const url = new URL(req.url())
      const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' }
      if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors })
      if (url.pathname.startsWith('/auth/v1/token')) {
        return route.fulfill({ status: 200, headers: cors, contentType: 'application/json', body: JSON.stringify({ access_token: jwt, token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: 'r1', user }) })
      }
      if (url.pathname.startsWith('/auth/v1/user')) return route.fulfill({ status: 200, headers: cors, contentType: 'application/json', body: JSON.stringify(user) })
      if (url.pathname.startsWith('/auth/v1/')) return route.fulfill({ status: 200, headers: cors, contentType: 'application/json', body: '{}' })
      if (url.pathname.startsWith('/rest/v1/')) {
        const table = url.pathname.slice('/rest/v1/'.length)
        let body = null
        try { body = req.postDataJSON() } catch {}
        let data = rest(table, req.method(), body, url)
        const single = (req.headers()['accept'] || '').includes('vnd.pgrst.object')
        if (single && Array.isArray(data)) data = data[0] ?? null
        return route.fulfill({ status: 200, headers: { ...cors, 'content-range': '0-0/1' }, contentType: 'application/json', body: JSON.stringify(data) })
      }
      return route.abort()
    })

    const shot = (name) => page.screenshot({ path: path.join(OUT, `${tag}-${name}.png`), fullPage: true })
    await page.goto('http://localhost:4173/login')
    await page.waitForSelector('#l-email')
    await shot('login')
    await page.fill('#l-email', 'alice@example.com')
    await page.fill('#l-pass', 'password123')
    await page.click('button.btn-primary')
    await page.waitForURL('http://localhost:4173/')
    await page.waitForSelector('.task')
    await page.waitForTimeout(300)
    await shot('today')

    // complete a task (optimistic + undo toast)
    await page.click('.task .check >> nth=1')
    await page.waitForSelector('.toast')
    await shot('today-done')

    // new task modal
    await page.evaluate(() => window.scrollTo(0, 0))
    if (viewport.width > 820) await page.click('.sidenav .btn-primary'); else await page.click('.fab')
    await page.waitForSelector('#t-title')
    await page.fill('#t-title', 'Buy sealing silicone')
    await shot('task-form')
    await page.click('text=Make it repeat…')
    await page.waitForSelector('#c-title')
    await page.waitForTimeout(200)
    await shot('chore-form')
    await page.keyboard.press('Escape')

    await page.goto('http://localhost:4173/calendar'); await page.waitForSelector('.cal'); await shot('calendar')
    await page.goto('http://localhost:4173/spaces'); await page.waitForSelector('.space'); await shot('spaces')
    await page.goto(`http://localhost:4173/spaces/${FLAT}`); await page.waitForSelector('.tabs'); await shot('space-tasks')
    for (const t of ['chores', 'people', 'activity', 'settings']) {
      await page.goto(`http://localhost:4173/spaces/${FLAT}?tab=${t}`); await page.waitForSelector('.tabs'); await page.waitForTimeout(250); await shot(`space-${t}`)
    }
    // edit chore from chores tab
    await page.goto(`http://localhost:4173/spaces/${FLAT}?tab=chores`); await page.waitForSelector('.chore')
    await page.click('.chore >> nth=0'); await page.waitForSelector('#c-title'); await page.waitForTimeout(200); await shot('chore-edit')
    await page.keyboard.press('Escape')

    await page.goto('http://localhost:4173/trades'); await page.waitForSelector('.trade'); await shot('trades')
    // trade dialog via the task menu on Today
    await page.goto('http://localhost:4173/'); await page.waitForSelector('.task')
    await page.waitForTimeout(500)
    await shot('before-trade')
    const items = page.locator('.task', { hasText: 'Buy bin bags' })
    await items.locator('[aria-label="More actions"]').click()
    await page.click('text=Trade or hand over')
    await page.waitForSelector('.person')
    await page.locator('.person', { hasText: 'Bob' }).click()
    await page.waitForTimeout(200)
    await shot('trade-dialog')
    await page.keyboard.press('Escape')

    await page.goto('http://localhost:4173/profile'); await page.waitForSelector('#p-name'); await shot('profile')
    await page.goto('http://localhost:4173/invite/abc123'); await page.waitForSelector('h1'); await page.waitForTimeout(300); await shot('invite')
    await page.close()
  }
  try {
    await run({ width: 1280, height: 860 }, 'desktop')
    await run({ width: 390, height: 844 }, 'mobile')
  } catch (e) {
    errors.push(`flow failed: ${e.message}`)
  }
  await browser.close()
  server.close()
  if (errors.length) { console.log(errors.join('\n')); process.exit(1) }
  console.log('smoke ok')
})()
