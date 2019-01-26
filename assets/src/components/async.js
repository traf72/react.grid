export default function runAsync(func, delay = 0) {
    setTimeout(() => func(), delay);
}
