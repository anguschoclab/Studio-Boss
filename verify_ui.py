from playwright.sync_api import sync_playwright, expect
import os

os.makedirs("verification/video", exist_ok=True)

def verify_feature(page):
    # Navigate to app
    page.goto("http://localhost:8080/")

    # Check if we need to start a new game
    try:
        if page.get_by_role("button", name="New Game").is_visible(timeout=5000):
            page.get_by_role("button", name="New Game").click()
            page.wait_for_timeout(500)

            # Setup Studio
            page.get_by_role("textbox").fill("Premium Studio")
            page.get_by_text("Indie Darling").click()
            page.get_by_role("button", name="Launch Studio").click()
    except Exception as e:
        print("Could not find New Game sequence, proceeding...")

    # Wait for dashboard to load
    page.wait_for_timeout(2000)

    # Take screenshot of the initial state (Dashboard)
    page.screenshot(path="verification/dashboard_premium.png", full_page=True)
    page.wait_for_timeout(500)

    # Attempt to advance week if button exists
    try:
        advance_btn = page.get_by_role("button", name="Advance Week")
        if advance_btn.is_visible(timeout=2000):
            advance_btn.click()
            page.wait_for_timeout(1000)
            page.screenshot(path="verification/week_summary_premium.png")
            page.wait_for_timeout(500)
            page.get_by_role("button", name="Continue").click()
            page.wait_for_timeout(500)
    except Exception as e:
        print("Advance Week button not found, skipping modal capture")

    # Navigate to The Trades (News)
    try:
        news_link = page.get_by_role("link", name="News")
        if news_link.is_visible(timeout=2000):
            news_link.click()
            page.wait_for_timeout(1000)
            page.screenshot(path="verification/trades_premium.png", full_page=True)
    except Exception as e:
        print("News link not found, skipping trades capture")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
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
