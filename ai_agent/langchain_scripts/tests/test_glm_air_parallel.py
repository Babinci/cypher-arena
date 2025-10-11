import asyncio
import time
from functools import wraps
from ..config import llm_glm_air
from .test_utils import country_prompt_generator
import argparse


def time_async_llm_calls(func):
    """Decorator to measure async LLM invocation time"""

    @wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        result = await func(*args, **kwargs)
        end_time = time.time()
        duration = end_time - start_time
        print(
            f"[TIMING] {func.__name__ if hasattr(func, '__name__') else 'Async LLM calls'} took {duration:.2f} seconds"
        )
        return result

    return wrapper


async def invoke_glm_air_async(prompt, index):
    """Async wrapper for GLM air invocation"""
    try:
        result = await llm_glm_air.ainvoke(prompt)
        print(f"Call {index}: {result.content.strip()}")
        return result
    except Exception as e:
        print(f"Error in call {index}: {e}")
        return None


@time_async_llm_calls
async def test_glm_air_parallel(num_calls=5):
    """Test GLM air with 5 parallel async calls"""
    print(f"Testing GLM Air with {num_calls} parallel async calls...")
    print("-" * 50)

    # Get 5 prompts from the generator
    prompts = []
    prompt_gen = country_prompt_generator()
    for _ in range(num_calls):
        prompts.append(next(prompt_gen))

    # Create tasks for parallel execution
    tasks = [invoke_glm_air_async(prompt, i + 1) for i, prompt in enumerate(prompts)]

    # Execute all tasks concurrently
    results = await asyncio.gather(*tasks, return_exceptions=True)

    print("-" * 50)
    print(
        f"Completed {len([r for r in results if r is not None])} out of {len(tasks)} calls successfully"
    )

    return results


if __name__ == "__main__":

    # argparse for number of calls

    parser = argparse.ArgumentParser(
        description="Test GLM Air with parallel async calls"
    )
    parser.add_argument(
        "--num_calls",
        type=int,
        default=5,
        help="Number of parallel calls to make (default: 5)",
    )
    args = parser.parse_args()
    # Run the async test
    asyncio.run(test_glm_air_parallel(args.num_calls))
