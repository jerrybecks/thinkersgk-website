#!/usr/bin/env python3
"""Post a message to Agent Room threads.json directly (no HTTP needed).

Usage:
  python3 post-message.py <thread_id> <author> <message>
  python3 post-message.py --list                          # list open threads
  python3 post-message.py --read <thread_id> [count]      # read last N messages

Examples:
  python3 post-message.py mn5h4nr2jwc7t codex "Hello from Codex!"
  python3 post-message.py --read mn5h4nr2jwc7t 10
"""

import json, sys, time, random, string, os

THREADS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "threads.json")


def load():
    with open(THREADS_FILE) as f:
        return json.load(f)


def save(data):
    with open(THREADS_FILE, "w") as f:
        json.dump(data, f, indent=2)


def list_threads():
    data = load()
    for t in data["threads"]:
        status = t.get("status", "?")
        msgs = len(t.get("messages", []))
        topic = t.get("topic", "?")
        participants = ", ".join(t.get("participants", []))
        marker = " *" if status == "open" else ""
        print(f"  {t['id']}: {topic} ({msgs} msgs, {status}{marker}) [{participants}]")


def read_thread(thread_id, count=10):
    data = load()
    for t in data["threads"]:
        if t["id"] == thread_id:
            msgs = t.get("messages", [])
            for m in msgs[-count:]:
                ts = m.get("timestamp", "?")[:16]
                author = m.get("author", "?")
                content = m.get("content", "")[:500]
                print(f"[{ts}] {author}: {content}\n")
            return
    print(f"Thread {thread_id} not found")


def post_message(thread_id, author, content):
    data = load()
    thread = None
    for t in data["threads"]:
        if t["id"] == thread_id:
            thread = t
            break

    if not thread:
        print(f"Error: Thread {thread_id} not found")
        sys.exit(1)

    if thread.get("status") == "resolved":
        print("Error: Thread is resolved")
        sys.exit(1)

    msg_id = hex(int(time.time()))[2:] + "".join(
        random.choices(string.ascii_lowercase + string.digits, k=5)
    )
    message = {
        "id": msg_id,
        "author": author,
        "content": content,
        "position": None,
        "references": [],
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime()),
    }

    thread["messages"].append(message)
    thread["updated"] = message["timestamp"]
    save(data)
    print(f"Posted to '{thread.get('topic', '?')}' as {author} (id: {msg_id})")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    if sys.argv[1] == "--list":
        list_threads()
    elif sys.argv[1] == "--read":
        tid = sys.argv[2] if len(sys.argv) > 2 else None
        count = int(sys.argv[3]) if len(sys.argv) > 3 else 10
        if not tid:
            print("Usage: post-message.py --read <thread_id> [count]")
            sys.exit(1)
        read_thread(tid, count)
    else:
        if len(sys.argv) < 4:
            print("Usage: post-message.py <thread_id> <author> <message>")
            sys.exit(1)
        post_message(sys.argv[1], sys.argv[2], " ".join(sys.argv[3:]))
