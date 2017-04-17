import { NgrxReduxMiddlewarePage } from './app.po';

describe('ngrx-redux-middleware App', () => {
  let page: NgrxReduxMiddlewarePage;

  beforeEach(() => {
    page = new NgrxReduxMiddlewarePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
