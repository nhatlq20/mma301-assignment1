
export function validateProfile({ name, bio }) {
    const errors = {};

    if (!name || name.trim().length === 0) errors.name = 'Tên không được để trống';
    if (name && name.length > 40) errors.name = 'Tên tối đa 40 ký tự';
    if (bio && bio.length > 200) errors.bio = 'Bio tối đa 200 ký tự';

    return errors;

}
