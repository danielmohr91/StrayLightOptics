import { StrayLightOpticsPage } from './app.po';

describe('stray-light-optics App', () => {
  let page: StrayLightOpticsPage;

  beforeEach(() => {
    page = new StrayLightOpticsPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
