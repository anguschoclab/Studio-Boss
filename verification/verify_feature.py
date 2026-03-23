from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(record_video_dir="/app/verification/video", viewport={'width': 1280, 'height': 720})
        page = context.new_page()
        try:
            page.goto("http://localhost:8080/")
            page.wait_for_timeout(2000)

            page.screenshot(path="/app/verification/verification.png")
            page.wait_for_timeout(1000)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            context.close()
            browser.close()

if __name__ == "__main__":
    run()
