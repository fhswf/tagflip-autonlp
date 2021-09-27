import asyncio

import psutil


async def async_wait_for_process(loop, process: psutil.Process, timeout):
    """
    Waits for process to be finished asynchronously and times out if process not returns within given time
    :param process: the process
    :param timeout: the timeout
    :return:
    """
    try:
        await asyncio.wait_for(loop.run_in_executor(None, process.wait), timeout=timeout)
    except asyncio.exceptions.TimeoutError as  e:
        raise e
