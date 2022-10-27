import { TbynPage } from './app.po';

describe('tbyn App', () => {
  let page: TbynPage;

  beforeEach(() => {
    page = new TbynPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
