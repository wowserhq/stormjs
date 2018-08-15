function ___syscall140(which, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    // llseek
    var stream = SYSCALLS.getStreamFromFD(), offset_high = SYSCALLS.get(), offset_low = SYSCALLS.get(), result = SYSCALLS.get(), whence = SYSCALLS.get();
    // NOTE: offset_high is unused - Emscripten's off_t is 32-bit

    // Ugly workaround for seeking >= 2 ** 31 bytes
    //
    // If whence is SEEK_SET, assume the value cannot be negative. This permits
    // SEEK_SET to seek to offsets >= 2 ** 31 and <= 2 ** 32.
    //
    // This workaround does *not* account for cases where offsets used with
    // SEEK_CUR or SEEK_END are >= 2 ** 31. Such cases will produce unexpected
    // behavior.
    var offset = whence === 0 ? offset_low >>> 0 : offset_low;

    FS.llseek(stream, offset, whence);
    HEAP32[((result)>>2)]=stream.position;
    if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null; // reset readdir state
    return 0;
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
}
