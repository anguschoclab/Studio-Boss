import sys
from playwright.sync_api import sync_playwright, expect

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(record_video_dir="verification/video", viewport={'width': 1280, 'height': 720})
        page = context.new_page()

        page.on("console", lambda msg: print(f"Browser Console: {msg.text}"))
        page.on("pageerror", lambda err: print(f"Browser Page Error: {err.message}"))

        print("Navigating to app...")
        page.goto("http://localhost:8080/")
        page.wait_for_timeout(5000)

        print("DOM root children:")
        print(page.evaluate("document.getElementById('root').innerHTML"))

        context.close()
        browser.close()

if __name__ == "__main__":
    main()
