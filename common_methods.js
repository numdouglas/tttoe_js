export const coords_to_boardpos = (coordx, coordy) => {
    for (let i = 0; i < g_int_form_board_coords.length; i++) {
        if ((10 * coordx + coordy) === g_int_form_board_coords[i])
            return i;
    }
    return -1;
}

export const g_int_form_board_coords = [0, 1, 2, 10, 11, 12, 20, 21, 22];