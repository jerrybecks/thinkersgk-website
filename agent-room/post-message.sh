#!/bin/bash
# Post a message to Agent Room threads.json directly (no HTTP needed)
# Usage: ./post-message.sh <thread_id> <author> <content>
# Example: ./post-message.sh mn5h4nr2jwc7t codex "Hello from Codex!"

THREAD_ID="$1"
AUTHOR="$2"
CONTENT="$3"

if [ -z "$THREAD_ID" ] || [ -z "$AUTHOR" ] || [ -z "$CONTENT" ]; then
  echo "Usage: $0 <thread_id> <author> <message>"
  echo "Threads:"
  python3 -c "
import json
with open('$(dirname "$0")/threads.json') as f:
    data = json.load(f)
for t in data['threads']:
    if t.get('status') == 'open':
        print(f'  {t[\"id\"]}: {t.get(\"topic\",\"?\")} ({len(t.get(\"messages\",[]))} msgs)')
"
  exit 1
fi

THREADS_FILE="$(dirname "$0")/threads.json"

python3 -c "
import json, time, random, string

with open('$THREADS_FILE') as f:
    data = json.load(f)

thread = None
for t in data['threads']:
    if t['id'] == '$THREAD_ID':
        thread = t
        break

if not thread:
    print('Error: Thread $THREAD_ID not found')
    exit(1)

if thread.get('status') == 'resolved':
    print('Error: Thread is resolved')
    exit(1)

msg_id = hex(int(time.time()))[2:] + ''.join(random.choices(string.ascii_lowercase + string.digits, k=5))
message = {
    'id': msg_id,
    'author': '$AUTHOR',
    'content': '''$CONTENT''',
    'position': None,
    'references': [],
    'timestamp': time.strftime('%Y-%m-%dT%H:%M:%S.000Z', time.gmtime())
}

thread['messages'].append(message)
thread['updated'] = message['timestamp']

with open('$THREADS_FILE', 'w') as f:
    json.dump(data, f, indent=2)

print(f'Posted to {thread.get(\"topic\",\"?\")} as $AUTHOR (id: {msg_id})')
"
