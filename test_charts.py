import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Record video
        context = await browser.new_context(record_video_dir="verification/video")
        page = await context.new_page()

        await page.goto(f"http://localhost:8080/")

        # Wait for the app to hydrate
        await asyncio.sleep(2)

        # We need to start a game to see the charts
        try:
            await page.get_by_role("button", name="New Game").click(timeout=5000)
            await asyncio.sleep(0.5)
            await page.get_by_role("textbox").fill("Testing Studio")
            await page.get_by_text("Indie Darling").click()
            await page.get_by_role("button", name="Launch Studio").click()
            await asyncio.sleep(2)
        except Exception as e:
            print("Couldn't start game:", e)

        # Take a screenshot
        await page.screenshot(path="verification/test.png", full_page=True)

        await context.close()
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
