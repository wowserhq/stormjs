#include "StormLib.h"
#include <emscripten/bind.h>

using namespace emscripten;

class EmPtr {
  public:
    void* ptr = nullptr;

    EmPtr() {}

    size_t getAddr() const {
      return (size_t)ptr;
    }

    bool isNull() const {
      return ptr == nullptr;
    }
};

bool EmSFileCloseArchive(EmPtr& pMpq) {
  return SFileCloseArchive(pMpq.ptr);
}

bool EmSFileCloseFile(EmPtr& pFile) {
  return SFileCloseFile(pFile.ptr);
}

bool EmSFileHasFile(EmPtr& pMpq, const std::string& sFileName) {
  return SFileHasFile(pMpq.ptr, sFileName.c_str());
}

bool EmSFileOpenArchive(const std::string& sMpqName, uint32_t uPriority, uint32_t uFlags, EmPtr& pMpq) {
  return SFileOpenArchive(sMpqName.c_str(), uPriority, uFlags, &pMpq.ptr);
}

bool EmSFileOpenFileEx(EmPtr& pMpq, const std::string& sFileName, uint32_t uSearchScope, EmPtr& pFile) {
  return SFileOpenFileEx(pMpq.ptr, sFileName.c_str(), uSearchScope, &pFile.ptr);
}

EMSCRIPTEN_BINDINGS(EmStormLib) {
  class_<EmPtr>("Ptr")
    .constructor()
    .function("getAddr", &EmPtr::getAddr)
    .function("isNull", &EmPtr::isNull);

  function("GetLastError", &GetLastError);

  function("SFileCloseArchive", &EmSFileCloseArchive);
  function("SFileCloseFile", &EmSFileCloseFile);
  function("SFileHasFile", &EmSFileHasFile);
  function("SFileOpenArchive", &EmSFileOpenArchive);
  function("SFileOpenFileEx", &EmSFileOpenFileEx);
}
