import { loadComponents } from './loader.js';
import { headerBehavior } from './headerBehavior.js';
import { burgerMenu } from './burgerMenu.js';

async function init() {
    await loadComponents();

    headerBehavior();
    burgerMenu();
}

init();