describe('Cypress Automation Demo on UI Testing Playground', () => {

  // این بخش قبل از اجرای هر تست به صورت خودکار اجرا می‌شود
  beforeEach(() => {
    // ورود به صفحه اصلی Playground
    cy.visit('http://uitestingplayground.com');
  });

  it('1. Should handle text input and update dynamic UI state', () => {
    // رفتن به صفحه تست Text Input
    cy.contains('Text Input').click();

    // وارد کردن متن در فیلد با استفاده از شناسه پایدار
    const customText = 'LinkedIn Showcase';
    cy.get('#newButtonName').type(customText);
    
    // کلیک روی دکمه برای اعمال تغییرات
    cy.get('#updatingButton').click();

    // بررسی اینکه متن دکمه به درستی آپدیت شده باشد
    cy.get('#updatingButton')
      .should('be.visible')
      .and('have.text', customText);
  });

  it('2. Should click elements with changing, dynamic IDs safely', () => {
    // رفتن به صفحه تست Dynamic ID
    cy.contains('Dynamic ID').click();

    // کلیک روی دکمه بر اساس متن آن و نادیده گرفتن ID متغیر و غیرپایدار
    cy.contains('button', 'Button with Dynamic ID')
      .should('be.visible')
      .click();
  });

  it('3. Should handle client-side delays and AJAX data injection', () => {
    // رفتن به صفحه تست AJAX Data
    cy.contains('AJAX Data').click();

    // کلیک روی دکمه برای ارسال درخواست AJAX
    cy.get('#ajaxButton').click();

    // اصلاح شده: برای پایداری بیشتر، وجود عنصر و بخشی از متن اصلی بررسی می‌شود
    cy.get('.bg-success', { timeout: 20000 })
      .should('be.visible')
      .and('contain', 'Data loaded');
  });

  it('4. Should find and click a specific element hidden within a scrolling container', () => {
    // رفتن به صفحه تست Scrollbars
    cy.contains('Scrollbars').click();

    // اسکرول خودکار به سمت دکمه مخفی شده و سپس کلیک روی آن
    cy.get('#hidingButton')
      .scrollIntoView()
      .should('be.visible')
      .click();
  });
});
