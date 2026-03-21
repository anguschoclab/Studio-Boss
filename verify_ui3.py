from playwright.sync_api import sync_playwright
import time
import os

os.makedirs("verification/video", exist_ok=True)

def verify_feature(page):
    # Navigate to app
    page.goto("http://localhost:8080/")

    # Wait for the page to fully load and hydrate
    page.wait_for_load_state('networkidle')
    time.sleep(2) # Additional sleep for React to hydrate

    # Clear local storage to ensure fresh state
    page.evaluate("window.localStorage.clear();")
    page.goto("http://localhost:8080/")
    page.wait_for_load_state('networkidle')
    time.sleep(2)

    # Check if we need to start a new game
    try:
        new_game_btn = page.get_by_role("button", name="New Game")
        if new_game_btn.is_visible(timeout=5000):
            new_game_btn.click()
            time.sleep(1)

            # Setup Studio
            page.get_by_role("textbox").fill("Premium Studio")
            page.get_by_text("Indie Darling").click()
            page.get_by_role("button", name="Launch Studio").click()
            time.sleep(2) # Wait for setup to complete and dashboard to load
    except Exception as e:
        print(f"Could not find or click New Game sequence: {e}")

    # Wait for dashboard to definitely load
    time.sleep(3)

    # Take screenshot of the initial state (Dashboard)
    page.screenshot(path="verification/dashboard_premium3.png", full_page=True)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=['--disable-web-security', '--no-sandbox']
        )
        context = browser.new_context(
            record_video_dir="verification/video",
            viewport={"width": 1440, "height": 900}
        )
        page = context.new_page()
        try:
            verify_feature(page)
        finally:
            context.close()
            browser.close()
