#include "StormLib.h"
#include <emscripten/bind.h>

using namespace emscripten;

class EmPtr {
  public:
    void* ptr;

    uint32_t toUint32() const {
      return *(uint32_t*)ptr;
    }

    void nullify() {
      ptr = nullptr;
    }
};

bool EmSFileOpenArchive(const std::string& sMpqName, uint32_t uPriority, uint32_t uFlags, EmPtr& pMpq) {
  return SFileOpenArchive(sMpqName.c_str(), uPriority, uFlags, &pMpq.ptr);
}

EMSCRIPTEN_BINDINGS(EmStormLib) {
  class_<EmPtr>("Ptr")
    .constructor()
    .function("toUint32", &EmPtr::toUint32)
    .function("nullify", &EmPtr::nullify);

  function("SFileOpenArchive", &EmSFileOpenArchive);
}
