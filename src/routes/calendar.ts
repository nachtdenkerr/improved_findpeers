import { Router } from "express";

const router = Router();

// Minimal in-memory fallback (only used if localStorage is unavailable)
const memoryBookings: Record<string, boolean> = {};

router.get("/", (_req, res) => {
  res.send(`
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Calendar Page</title>
        <style>
          :root {
            --gap: 8px;
            --radius: 10px;
            --border: #d0d7de;
            --study: #e0f7fa;       /* light cyan */
            --consulting: #ffe0b2;  /* light orange */
            --booked: #e6e6e6;      /* grey */
            --text: #0f172a;
            --muted: #64748b;
            --brand: #4a90e2;
          }
          html, body { height:100%; }
          body { font-family: -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif; margin: 0; color: var(--text); }
          header { display:flex; align-items:center; gap:12px; padding: 16px 20px; border-bottom: 1px solid var(--border); }
          header h1 { margin: 0; color: var(--brand); }
          .legend { display:flex; align-items:center; gap: 10px; font-size: 14px; color: var(--muted); }
          .badge { padding: 4px 10px; border-radius: 999px; border:1px solid var(--border); }
          .badge.study { background: var(--study); }
          .badge.consulting { background: var(--consulting); }
          main { padding: 18px 20px 40px; }

          .grid { display:grid; grid-template-columns: 90px repeat(5, 1fr); gap: var(--gap); align-items: stretch; }
          .cell { border:1px solid var(--border); border-radius: var(--radius); padding:10px; background:#fff; min-height:56px; display:flex; align-items:center; justify-content:center; font-size:14px; }
          .cell.header { background:#f8fafc; font-weight:600; }
          .cell.time { background:#f8fafc; color: var(--muted); font-weight:500; }

          .slot { cursor:pointer; transition: transform .06s ease; }
          .slot:hover { transform: translateY(-1px); }
          .slot.study { background: var(--study); }
          .slot.consulting { background: var(--consulting); }
          .slot.booked { background: var(--booked) !important; color:#666; text-decoration: line-through; }

          .toolbar { display:flex; gap: 10px; margin: 10px 0 16px; }
          .toolbar select, .toolbar button { padding:8px 10px; border-radius: 8px; border:1px solid var(--border); font-size:14px; }
          .toolbar button { cursor:pointer; }
          .hint { color: var(--muted); font-size: 13px; }
        </style>
      </head>
      <body>
        <header>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="18" height="16" rx="3" stroke="#4a90e2"/><path d="M3 9.5H21" stroke="#4a90e2"/><path d="M8 3V7" stroke="#4a90e2"/><path d="M16 3V7" stroke="#4a90e2"/></svg>
          <h1>Calendar Page</h1>
          <div class="legend">
            <span class="badge study">Group study</span>
            <span class="badge consulting">Consulting</span>
          </div>
        </header>
        <main>
          <div class="hint">Click a slot to toggle booking. Type affects color.</div>

          <div class="toolbar">
            <label>
              Type:
              <select id="typePicker">
                <option value="study">Group study</option>
                <option value="consulting">Consulting</option>
              </select>
            </label>
            <button id="clearBtn" title="Clear all bookings (local only)">Clear bookings</button>
          </div>

          <div id="grid" class="grid"></div>
        </main>

        <script>
          (function(){
            const DAYS = ["Mon","Tue","Wed","Thu","Fri"];
            const TIMES = ["10:00","11:00","12:00","13:00","14:00"]; // demo hours

            const grid = document.getElementById('grid');
            const typePicker = document.getElementById('typePicker');
            const clearBtn = document.getElementById('clearBtn');

            // Key helpers
            const keyOf = (d,t) => d + '|' + t;

            // Local storage booking store
            const ls = (() => {
              try { return window.localStorage; } catch (e) { return null; }
            })();

            function getStore(){
              if (ls) {
                try { return JSON.parse(ls.getItem('calendar_bookings') || '{}'); } catch(_) { return {}; }
              }
              return ${JSON.stringify(memoryBookings)};
            }
            function setStore(obj){
              if (ls) { ls.setItem('calendar_bookings', JSON.stringify(obj)); }
              else {
                // no-op for server memory demo
              }
            }

            function render(){
              grid.innerHTML = '';
              // header row
              grid.appendChild(cell('','header time'));
              DAYS.forEach(d => grid.appendChild(cell(d,'header')));
              const store = getStore();
              TIMES.forEach(t => {
                grid.appendChild(cell(t,'time'));
                DAYS.forEach(d => {
                  const k = keyOf(d,t);
                  const meta = store[k] || { type: 'study', booked: false };
                  const c = ['cell','slot', meta.type, meta.booked ? 'booked' : ''].join(' ');
                  const el = cell(meta.booked ? 'Booked' : meta.type === 'study' ? 'Study' : 'Consult', c);
                  el.dataset.day = d; el.dataset.time = t;
                  el.addEventListener('click', () => toggle(d,t));
                  grid.appendChild(el);
                });
              });
            }

            function cell(text, cls){
              const div = document.createElement('div');
              div.className = 'cell ' + (cls||'');
              div.textContent = text;
              return div;
            }

            function toggle(day, time){
              const store = getStore();
              const k = keyOf(day,time);
              const existing = store[k] || { type: 'study', booked: false };
              // Set/flip booking using currently selected type
              store[k] = { type: typePicker.value, booked: !existing.booked };
              setStore(store);
              render();
            }

            clearBtn.addEventListener('click', () => { setStore({}); render(); });

            render();
          })();
        </script>
      </body>
    </html>
  `);
});

export default router;