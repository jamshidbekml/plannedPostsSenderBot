import { Keyboard } from 'grammy';
import messages from './messages';

const Keyboards = {
    main_menu: new Keyboard().text(messages.channels).resized(),
};

export default Keyboards;
