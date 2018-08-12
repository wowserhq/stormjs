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

class EmVoidPtr : public EmPtr {
  public:
    EmVoidPtr() : EmPtr() {}
};

class EmUint32Ptr : public EmPtr {
  public:
    EmUint32Ptr() : EmPtr() {
      uint32_t value = 0;
      ptr = &value;
    }

    uint32_t toJS() const {
      return *(uint32_t*)ptr;
    }
};

class EmBuf {
  public:
    uint32_t size;
    uint8_t* ptr;

    EmBuf(uint32_t s) {
      size = s;
      ptr = new uint8_t[s];
    }

    ~EmBuf() {
      delete ptr;
    }

    uint32_t getSize() const {
      return size;
    }

    val toJS() {
      return val(typed_memory_view(size, ptr));
    }
};

bool EmSFileCloseArchive(EmPtr& pMpq) {
  return SFileCloseArchive(pMpq.ptr);
}

bool EmSFileCloseFile(EmPtr& pFile) {
  return SFileCloseFile(pFile.ptr);
}

bool EmSFileFindClose(EmPtr& pFind) {
  return SFileFindClose(pFind.ptr);
}

EmPtr EmSFileFindFirstFile(EmPtr& pMpq, const std::string& sMask, SFILE_FIND_DATA& pFindFileData, const std::string& sListFile) {
  EmPtr* pFind = new EmPtr;
  pFind->ptr = SFileFindFirstFile(pMpq.ptr, sMask.c_str(), &pFindFileData, sListFile.c_str());
  return *pFind;
}

std::string EmSFileFindDataGetFileName(const SFILE_FIND_DATA& data) {
  return data.cFileName;
}

std::string EmSFileFindDataGetPlainName(const SFILE_FIND_DATA& data) {
  return data.szPlainName;
}

val EmSFileFindDataToJS(const SFILE_FIND_DATA& data) {
  val obj = val::object();

  obj.set("fileName", val(data.cFileName));
  obj.set("plainName", std::string(data.szPlainName));
  obj.set("hashIndex", data.dwHashIndex);
  obj.set("blockIndex", data.dwBlockIndex);
  obj.set("fileSize", data.dwFileSize);
  obj.set("compSize", data.dwCompSize);
  obj.set("fileTimeLo", data.dwFileTimeLo);
  obj.set("fileTimeHi", data.dwFileTimeHi);
  obj.set("locale", data.lcLocale);

  return obj;
}

bool EmSFileFindNextFile(EmPtr& pFind, SFILE_FIND_DATA& pFindFileData) {
  return SFileFindNextFile(pFind.ptr, &pFindFileData);
}

uint32_t EmSFileGetFileSize(EmPtr& pFile, EmPtr& pFileSizeHigh) {
  return SFileGetFileSize(pFile.ptr, static_cast<uint32_t*>(pFileSizeHigh.ptr));
}

bool EmSFileHasFile(EmPtr& pMpq, const std::string& sFileName) {
  return SFileHasFile(pMpq.ptr, sFileName.c_str());
}

bool EmSFileOpenArchive(const std::string& sMpqName, uint32_t uPriority, uint32_t uFlags, EmPtr& pMpq) {
  return SFileOpenArchive(sMpqName.c_str(), uPriority, uFlags, &pMpq.ptr);
}

bool EmSFileOpenPatchArchive(EmPtr& pMpq, const std::string& sMpqName, const std::string& sPatchPathPrefix, uint32_t uFlags) {
  return SFileOpenPatchArchive(pMpq.ptr, sMpqName.c_str(), sPatchPathPrefix.c_str(), uFlags);
}

bool EmSFileOpenFileEx(EmPtr& pMpq, const std::string& sFileName, uint32_t uSearchScope, EmPtr& pFile) {
  return SFileOpenFileEx(pMpq.ptr, sFileName.c_str(), uSearchScope, &pFile.ptr);
}

bool EmSFileReadFile(EmPtr& pFile, EmBuf& bData, uint32_t uToRead, EmPtr& pRead, EmPtr& pOverlapped) {
  return SFileReadFile(pFile.ptr, bData.ptr, uToRead, static_cast<uint32_t*>(pRead.ptr), static_cast<uint32_t*>(pOverlapped.ptr));
}

uint32_t EmSFileSetFilePointer(EmPtr& pFile, uint32_t uPos, EmPtr& pPosHigh, uint32_t uMoveMethod) {
  return SFileSetFilePointer(pFile.ptr, uPos, static_cast<int32_t*>(pPosHigh.ptr), uMoveMethod);
}

EMSCRIPTEN_BINDINGS(EmStormLib) {
  class_<EmBuf>("Buf")
    .constructor<uint32_t>()
    .function("getSize", &EmBuf::getSize)
    .function("toJS", &EmBuf::toJS);

  class_<EmPtr>("Ptr")
    .constructor()
    .function("getAddr", &EmPtr::getAddr)
    .function("isNull", &EmPtr::isNull);

  class_<EmVoidPtr, base<EmPtr>>("VoidPtr")
    .constructor();

  class_<EmUint32Ptr, base<EmPtr>>("Uint32Ptr")
    .constructor()
    .function("toJS", &EmUint32Ptr::toJS);

  class_<SFILE_FIND_DATA>("SFileFindData")
    .constructor()
    .property("fileName", &EmSFileFindDataGetFileName)
    .property("plainName", &EmSFileFindDataGetPlainName)
    .property("hashIndex", &SFILE_FIND_DATA::dwHashIndex)
    .property("blockIndex", &SFILE_FIND_DATA::dwBlockIndex)
    .property("fileSize", &SFILE_FIND_DATA::dwFileSize)
    .property("compSize", &SFILE_FIND_DATA::dwCompSize)
    .property("fileTimeLo", &SFILE_FIND_DATA::dwFileTimeLo)
    .property("fileTimeHi", &SFILE_FIND_DATA::dwFileTimeHi)
    .property("locale", &SFILE_FIND_DATA::lcLocale)
    .function("toJS", &EmSFileFindDataToJS);

  function("GetLastError", &GetLastError);

  function("SFileCloseArchive", &EmSFileCloseArchive);
  function("SFileCloseFile", &EmSFileCloseFile);
  function("SFileFindClose", &EmSFileFindClose);
  function("SFileFindFirstFile", &EmSFileFindFirstFile);
  function("SFileFindNextFile", &EmSFileFindNextFile);
  function("SFileGetFileSize", &EmSFileGetFileSize);
  function("SFileHasFile", &EmSFileHasFile);
  function("SFileOpenArchive", &EmSFileOpenArchive);
  function("SFileOpenPatchArchive", &EmSFileOpenPatchArchive);
  function("SFileOpenFileEx", &EmSFileOpenFileEx);
  function("SFileReadFile", &EmSFileReadFile);
  function("SFileSetFilePointer", &EmSFileSetFilePointer);

  constant("ERROR_FILE_NOT_FOUND", ERROR_FILE_NOT_FOUND);
  constant("ERROR_NO_MORE_FILES", ERROR_NO_MORE_FILES);
  constant("FILE_BEGIN", FILE_BEGIN);
  constant("SFILE_INVALID_SIZE", SFILE_INVALID_SIZE);
  constant("STREAM_FLAG_READ_ONLY", STREAM_FLAG_READ_ONLY);
}
