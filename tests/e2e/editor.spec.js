import { expect, test } from '@playwright/test';

const setEditorStorage = async (page, theme = 'light') => {
  await page.addInitScript(({ initialTheme }) => {
    localStorage.setItem('streamlit-auth-token', 'e2e-test-token');
    localStorage.setItem('app-theme', initialTheme);
    localStorage.setItem('app-lang', 'ru');
    localStorage.removeItem('streamlit-editor-draft');
    localStorage.removeItem('streamlit-editor-pages-draft');
    localStorage.removeItem('streamlit-editor-dataset-draft');
  }, { initialTheme: theme });
};

test.beforeEach(async ({ page }) => {
  await setEditorStorage(page);
  await page.goto('/editor');
  await expect(page.locator('.dashboard-canvas')).toBeVisible();
});

test('component palette is compact and describes icons on hover', async ({ page }) => {
  const sidebar = page.locator('.editor-palette');
  const textComponent = sidebar.getByRole('button', { name: 'Текст' });

  await expect(sidebar).toHaveCSS('width', '68px');
  await expect(textComponent.locator('.palette-item-details')).toHaveCSS('display', 'none');

  await textComponent.hover();
  const tooltip = page.getByRole('tooltip');
  await expect(tooltip).toHaveText('Текст');
  await expect(tooltip).toHaveCSS('position', 'fixed');
  const tooltipLeft = await tooltip.evaluate((element) => element.getBoundingClientRect().left);
  const sidebarRight = await sidebar.evaluate((element) => element.getBoundingClientRect().right);
  expect(tooltipLeft).toBeGreaterThan(sidebarRight);
});

test('theme switch updates editor and canvas and can be switched back', async ({ page }) => {
  const canvas = page.locator('.dashboard-canvas');
  const canvasArea = page.locator('.editor-canvas-area');
  const toggle = page.getByRole('switch');

  const lightCanvasBackground = await canvas.evaluate((element) => getComputedStyle(element).backgroundColor);
  await expect(canvas).toHaveAttribute('data-canvas-theme', 'light');

  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(canvas).toHaveAttribute('data-canvas-theme', 'dark');
  await expect(canvasArea).toHaveAttribute('data-canvas-theme', 'dark');
  await expect.poll(() => canvas.evaluate((element) => getComputedStyle(element).backgroundColor))
    .not.toBe(lightCanvasBackground);

  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(canvas).toHaveAttribute('data-canvas-theme', 'light');
});

test('light theme uses soft action buttons and delete removes an element', async ({ page }) => {
  const paletteText = page.getByRole('button', { name: 'Текст' });
  await paletteText.click();

  const card = page.locator('.canvas-item-card').first();
  await expect(card).toBeVisible();
  await card.hover();

  const deleteButton = card.getByRole('button', { name: 'Удалить' });
  const buttonStyle = await deleteButton.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      backgroundImage: style.backgroundImage,
      color: style.color,
      borderColor: style.borderColor,
    };
  });

  expect(buttonStyle.backgroundImage).toContain('linear-gradient');
  expect(buttonStyle.color).not.toBe('rgb(255, 255, 255)');
  expect(buttonStyle.borderColor).not.toBe('rgba(0, 0, 0, 0)');

  await deleteButton.click();
  await expect(card).toHaveCount(0);
});

test('Delete and Backspace remove a selected canvas element', async ({ page }) => {
  await page.getByRole('button', { name: 'Текст' }).click();
  const card = page.locator('.canvas-item-card');
  await expect(card).toHaveCount(1);
  await card.click();

  await page.keyboard.press('Delete');
  await expect(card).toHaveCount(0);

  await page.getByRole('button', { name: 'Текст' }).click();
  await expect(card).toHaveCount(1);
  await card.click();

  await page.keyboard.press('Backspace');
  await expect(card).toHaveCount(0);
});

test('editor remains usable on a narrow mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await expect(page.locator('.editor-palette')).toBeHidden();
  await expect(page.locator('.dashboard-canvas')).toBeVisible();
  await expect(page.locator('.editor-header')).toBeVisible();
});
